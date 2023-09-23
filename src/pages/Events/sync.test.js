// const toArray = jest.fn().mockResolvedValue({})

import {syncEvents, syncParticipant, syncRegform} from './sync';
import {getEvent, getParticipant, getRegform} from '../../utils/client';
import db from '../../db/db';

jest.mock('../../db/db', () => {
  return {
    servers: {
      toArray() {
        return Promise.resolve([{id: 2}, {id: 1}]);
      },
      get() {
        return Promise.resolve({id: 1});
      },
    },
    events: {
      update: jest.fn(),
    },
    regforms: {
      update: jest.fn(),
    },
    participants: {
      update: jest.fn(),
    },
  };
});
jest.mock('../../utils/client', () => {
  return {
    getEvent: jest.fn(),
    getRegform: jest.fn(),
    getParticipant: jest.fn(),
  };
});
// jest.mock('./sync')

describe('test syncEvents()', () => {
  test('test with no events', async () => {
    const errorModal = jest.fn();

    await syncEvents([], null, errorModal);

    expect(db.events.update).not.toHaveBeenCalled();
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test successful response', async () => {
    const errorModal = jest.fn();
    const events = [
      {id: 42, title: 'Mock event 1', startDt: '2020-01-01'},
      {id: 43, title: 'Mock event 2', startDt: '2020-01-02'},
    ];

    getEvent
      .mockResolvedValueOnce({ok: true, data: events[0]})
      .mockResolvedValueOnce({ok: true, data: events[1]});

    const dbEvents = [
      {id: 1, serverId: 1},
      {id: 2, serverId: 2},
    ];

    await syncEvents(dbEvents, null, errorModal);

    expect(db.events.update.mock.calls[0]).toEqual([
      1,
      {indicoId: 42, title: 'Mock event 1', date: '2020-01-01'},
    ]);
    expect(db.events.update.mock.calls[1]).toEqual([
      2,
      {indicoId: 43, title: 'Mock event 2', date: '2020-01-02'},
    ]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test 404 response', async () => {
    const errorModal = jest.fn();

    getEvent.mockResolvedValue({ok: false, status: 404});

    await syncEvents([{id: 1, serverId: 1}], null, errorModal);

    expect(db.events.update.mock.calls[0]).toEqual([1, {deleted: true}]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test failed response', async () => {
    const errorModal = jest.fn();

    getEvent.mockResolvedValue({ok: false});

    await syncEvents([{id: 1, serverId: 1}], null, errorModal);

    expect(db.events.update).not.toHaveBeenCalled();
    expect(errorModal).toHaveBeenCalled();
  });
});

describe('test syncRegform()', () => {
  test('test successful response', async () => {
    const errorModal = jest.fn();
    const regform = {
      id: 42,
      title: 'Mock regform',
      isOpen: true,
      registrationCount: 12,
      checkedInCount: 6,
    };

    getRegform.mockResolvedValue({ok: true, data: regform});

    await syncRegform({id: 1, serverId: 1}, {id: 3}, null, errorModal);

    expect(db.regforms.update.mock.calls[0]).toEqual([
      3,
      {indicoId: 42, title: 'Mock regform', isOpen: true, registrationCount: 12, checkedInCount: 6},
    ]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test 404 response', async () => {
    const errorModal = jest.fn();

    getRegform.mockResolvedValue({ok: false, status: 404});

    await syncRegform([{id: 1, serverId: 1}], {id: 3}, null, errorModal);

    expect(db.regforms.update.mock.calls[0]).toEqual([3, {deleted: true}]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test failed response', async () => {
    const errorModal = jest.fn();
    getRegform.mockResolvedValue({ok: false});

    await syncRegform({id: 1, serverId: 1}, {id: 3}, null, errorModal);

    expect(db.regforms.update).not.toHaveBeenCalled();
    expect(errorModal).toHaveBeenCalled();
  });
});

describe('test syncParticipant()', () => {
  test('test successful response', async () => {
    const errorModal = jest.fn();
    const participant = {
      id: 42,
      fullName: 'John Doe',
      registrationDate: '2020-01-01',
      registrationData: [],
      state: 'complete',
      checkedIn: true,
      checkedInDt: '2020-01-02',
      occupiedSlots: 3,
    };

    getParticipant.mockResolvedValue({ok: true, data: participant});

    await syncParticipant({id: 1, serverId: 1}, {id: 3}, {id: 7}, null, errorModal);

    expect(db.participants.update.mock.calls[0]).toEqual([
      7,
      {
        indicoId: 42,
        fullName: 'John Doe',
        registrationDate: '2020-01-01',
        registrationData: [],
        state: 'complete',
        checkedIn: true,
        checkedInDt: '2020-01-02',
        occupiedSlots: 3,
      },
    ]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test 404 response', async () => {
    const errorModal = jest.fn();
    getParticipant.mockResolvedValue({ok: false, status: 404});

    await syncParticipant([{id: 1, serverId: 1}], {id: 3}, {id: 7}, null, errorModal);

    expect(db.participants.update.mock.calls[0]).toEqual([7, {deleted: true}]);
    expect(errorModal).not.toHaveBeenCalled();
  });

  test('test failed response', async () => {
    const errorModal = jest.fn();
    getParticipant.mockResolvedValue({ok: false});

    await syncParticipant({id: 1, serverId: 1}, {id: 3}, {id: 7}, null, errorModal);

    expect(db.participants.update).not.toHaveBeenCalled();
    expect(errorModal).toHaveBeenCalled();
  });
});

// const fn = () => {test: 1;}
