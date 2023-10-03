import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {CalendarDaysIcon, ServerStackIcon} from '@heroicons/react/20/solid';
import BottomNav from '../Components/BottomNav';
import EventItem from '../Components/Events/EventItem.tsx';
import {Typography} from '../Components/Tailwind/index.jsx';
import TopNav from '../Components/TopNav';
import db from '../db/db';
import {useErrorModal} from '../hooks/useModal';
import {useQuery, isLoading} from '../utils/db';
import {wait} from '../utils/wait.ts';
import {syncEvents} from './Events/sync.js';

export default function Homepage() {
  return (
    <>
      <TopNav />
      <HomepageContent />
      <BottomNav backBtnText="Home" />
    </>
  );
}

function HomepageContent() {
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const servers = useQuery(() => db.servers.toArray());
  const events = useQuery(() => db.events.toArray());
  const regforms = useQuery(() => db.regforms.toArray());

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const events = await db.events.toArray();
      await syncEvents(events, controller.signal, errorModal);
    }

    sync().catch(err =>
      errorModal({title: 'Something went wrong when updating events', content: err.message})
    );
    return () => controller.abort();
  }, [errorModal]);

  const navigateToEvent = async event => {
    await wait(100);
    navigate(`/event/${event.id}`);
  };

  if (isLoading(servers) || isLoading(events) || isLoading(regforms)) {
    return null;
  }

  const serversById = servers.reduce((acc, server) => {
    acc[server.id] = server;
    return acc;
  }, {});

  const eventsByServer = events.reduce((acc, event) => {
    if (!acc[event.serverId]) {
      acc[event.serverId] = [];
    }
    acc[event.serverId].push(event);
    return acc;
  }, {});

  const regformsByEvent = regforms.reduce((acc, regform) => {
    acc[regform.eventId] = (acc[regform.eventId] || 0) + 1;
    return acc;
  }, {});

  if (events.length === 0) {
    return <NoEventsBanner />;
  }

  if (servers.length === 1) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-1">
        {events.map(event => {
          return (
            <EventItem
              key={event.id}
              event={event}
              onClick={() => navigateToEvent(event)}
              quantity={regformsByEvent[event.id] || 0}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pt-1">
      {Object.entries(eventsByServer).map(([serverId, events]) => {
        const server = serversById[serverId];
        const host = new URL(server.baseUrl).host;
        return (
          <div key={serverId} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ServerStackIcon className="w-5 text-gray-700 dark:text-gray-400" />
              <Typography variant="body2">{host}</Typography>
            </div>
            <div className="flex flex-col gap-4">
              {events.map(event => {
                return (
                  <EventItem
                    key={event.id}
                    event={event}
                    onClick={() => navigateToEvent(event)}
                    quantity={regformsByEvent[event.id] || 0}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NoEventsBanner() {
  return (
    <div
      className="m-auto mx-4 flex items-center justify-center rounded-xl
                 bg-gray-100 p-6 text-center dark:bg-gray-800"
    >
      <div className="flex flex-col justify-center gap-2">
        <CalendarDaysIcon className="w-20 self-center text-gray-500 dark:text-gray-400" />
        <Typography variant="h2">No events found</Typography>
        <Typography variant="body1">Scan a QR code to add one</Typography>
      </div>
    </div>
  );
}
