import Dexie, {type EntityTable} from 'dexie';
import {useLiveQuery} from 'dexie-react-hooks';
import {FieldProps} from '../pages/participant/fields';
import {IndicoParticipant} from '../utils/client';

export type IDBBoolean = 1 | 0; // IndexedDB doesn't support indexing booleans, so we use {1,0} instead

interface _Server {
  baseUrl: string;
  clientId: string;
  scope: string;
  authToken: string;
}
export interface Server extends _Server {
  id: number;
}

type AddServer = _Server;

export interface _Event {
  indicoId: number;
  serverId: number;
  baseUrl: string;
  title: string;
  date: string;
}

export interface Event extends _Event {
  id: number;
  deleted: IDBBoolean;
}

interface AddEvent extends _Event {
  deleted?: boolean;
}

type GetEvent = number;

export interface _Regform {
  indicoId: number;
  eventId: number;
  title: string;
}

export interface Regform extends _Regform {
  id: number;
  isOpen: boolean;
  registrationCount: number;
  checkedInCount: number;
  deleted: IDBBoolean;
}

interface AddRegform extends _Regform {
  isOpen?: boolean;
  registrationCount?: number;
  checkedInCount?: number;
  deleted?: boolean;
}

type GetRegform =
  | number
  | {
      id: number;
      eventId: number;
    };

export interface RegistrationData {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

export type RegistrationState = 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';

interface _Participant {
  indicoId: number;
  regformId: number;
  fullName: string;
  registrationDate: string;
  // registrationData is not sent by Indico when listing all participants to save on bandwith.
  // We only fetch it once we actually navigate to the participant details page.
  registrationData?: RegistrationData[];
  state: RegistrationState;
  checkinSecret: string;
  checkedIn: boolean;
  checkedInDt?: string;
  checkedInLoading: boolean;
  occupiedSlots: number;
  price: number;
  currency: string;
  formattedPrice: string;
  isPaid: boolean;
  isPaidLoading: boolean;
}

export interface Participant extends _Participant {
  id: number;
  deleted: IDBBoolean;
  notes: string;
}

interface AddParticipant extends _Participant {
  deleted?: IDBBoolean;
  notes?: string;
}

type GetParticipant =
  | number
  | {
      id: number;
      regformId: number;
    };

class IndicoCheckin extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  servers!: EntityTable<Server, 'id'>;
  events!: EntityTable<Event, 'id'>;
  regforms!: EntityTable<Regform, 'id'>;
  participants!: EntityTable<Participant, 'id'>;

  constructor() {
    super('CheckinDatabase');
    this.version(1).stores({
      servers: 'id++, baseUrl, clientId',
      events: 'id++, indicoId, serverId, deleted',
      regforms: 'id++, indicoId, eventId, deleted, [id+eventId], [eventId+deleted]',
      participants: 'id++, indicoId, regformId, deleted, [id+regformId], [regformId+deleted]',
    });
  }
}

const db = new IndicoCheckin();

export default db;

export async function getEvent(id: GetEvent) {
  return await db.events.get(id);
}

export async function getRegform(id: GetRegform) {
  if (typeof id === 'number') {
    return await db.regforms.get(id);
  }
  return await db.regforms.get(id);
}

export async function getParticipant(id: GetParticipant) {
  if (typeof id === 'number') {
    return await db.participants.get(id);
  }
  return await db.participants.get(id);
}

export async function getServers() {
  return await db.servers.toArray();
}

export async function getEvents() {
  return await db.events.where({deleted: 0}).toArray();
}

export async function getRegforms(eventId?: number) {
  if (eventId === undefined) {
    return await db.regforms.where({deleted: 0}).toArray();
  }
  return await db.regforms.where({eventId, deleted: 0}).toArray();
}

export async function getParticipants(regformId: number) {
  return await db.participants.where({regformId, deleted: 0}).toArray();
}

export function useLiveServers(defaultValue?: Server[]) {
  return useLiveQuery(getServers, [], defaultValue || []);
}

export function useLiveEvent(eventId: number, defaultValue?: Event) {
  return useLiveQuery(() => getEvent(eventId), [eventId], defaultValue);
}

export function useLiveEvents(defaultValue?: Event[]) {
  return useLiveQuery(getEvents, [], defaultValue || []);
}

export function useLiveRegform(id: GetRegform, defaultValue?: Regform) {
  const deps = typeof id === 'number' ? [id] : Object.values(id);
  return useLiveQuery(() => getRegform(id), deps, defaultValue);
}

export function useLiveRegforms(eventId?: number, defaultValue?: Regform[]) {
  const deps = eventId === undefined ? [] : [eventId];
  return useLiveQuery(() => getRegforms(eventId), deps, defaultValue || []);
}

export function useLiveParticipant(id: GetParticipant, defaultValue?: Participant) {
  const deps = typeof id === 'number' ? [id] : Object.values(id);
  return useLiveQuery(() => getParticipant(id), deps, defaultValue);
}

export function useLiveParticipants(regformId: number, defaultValue?: Participant[]) {
  return useLiveQuery(() => getParticipants(regformId), [regformId], defaultValue || []);
}

export async function addServer(data: AddServer) {
  return await db.servers.add(data);
}

export async function addEvent(data: AddEvent) {
  const deleted = data.deleted ? 1 : 0;
  return await db.events.add({...data, deleted});
}

export async function addRegform(data: AddRegform) {
  const isOpen = !!data.isOpen;
  const registrationCount = data.registrationCount || 0;
  const checkedInCount = data.checkedInCount || 0;
  const deleted = data.deleted ? 1 : 0;
  return await db.regforms.add({...data, isOpen, registrationCount, checkedInCount, deleted});
}

export async function addParticipant(data: AddParticipant) {
  const deleted = data.deleted ? 1 : 0;
  const notes = data.notes || '';
  return await db.participants.add({
    ...data,
    deleted,
    notes,
    checkedInLoading: false,
    isPaidLoading: false,
  });
}

export async function addParticipants(data: AddParticipant[]) {
  const participants = data.map(p => ({
    ...p,
    deleted: (p.deleted ? 1 : 0) as IDBBoolean,
    notes: p.notes || '',
    checkedInLoading: false,
    isPaidLoading: false,
  }));

  // Firefox does not support compound indexes with auto-incrementing keys
  // Essentially, when inserting an item with an auto-incrementing key, the
  // index does not get updated so the item is not found when searching for it afterwards
  // A workaround is to first insert the items and then use put() with the new key which
  // forces the index to update.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1404276
  // There was a similar issue which has been fixed:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=701972
  if (isFirefox()) {
    return await db.transaction('readwrite', db.participants, async () => {
      const ids = await db.participants.bulkAdd(participants, {allKeys: true});
      const participantsWithIds = participants.map((p, i) => ({...p, id: ids[i]}));
      await db.participants.bulkPut(participantsWithIds);
    });
  } else {
    return await db.participants.bulkAdd(participants);
  }
}

export async function deleteEvent(id: number) {
  return db.transaction('readwrite', [db.events, db.regforms, db.participants], async () => {
    const regforms = await db.regforms.where({eventId: id}).toArray();
    for (const regform of regforms) {
      await db.participants.where({regformId: regform.id}).delete();
      await db.regforms.delete(regform.id);
    }
    await db.events.delete(id);
  });
}

export async function deleteRegform(id: number) {
  return db.transaction('readwrite', [db.regforms, db.participants], async () => {
    await db.participants.where({regformId: id}).delete();
    await db.regforms.delete(id);
  });
}

export async function updateParticipant(id: number, data: IndicoParticipant) {
  const {
    id: indicoId,
    fullName,
    registrationDate,
    registrationData,
    state,
    checkedIn,
    checkedInDt,
    occupiedSlots,
    price,
    currency,
    formattedPrice,
    isPaid,
  } = data;
  await db.participants.update(id, {
    indicoId,
    fullName,
    registrationDate,
    registrationData,
    state,
    occupiedSlots,
    checkedIn,
    checkedInDt,
    price,
    currency,
    formattedPrice,
    isPaid,
  });
}

function isFirefox() {
  return navigator.userAgent.toLowerCase().includes('firefox');
}
