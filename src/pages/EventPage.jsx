import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {getRegistrationForms} from '../db/utils';
import EventData from '../Models/EventData';
import {authFetch} from '../utils/network';

const EventPage = () => {
  const {state} = useLocation();
  const {title, date, server_base_url, id: eventID} = state; // Destructure the state object containing the Event object

  const [event, setEvent] = useState(new EventData(title, date));

  console.log('Server Base url:', server_base_url);

  useEffect(() => {
    // Fetch the event data from the server
    const fetchEventData = async () => {
      const response = await authFetch(server_base_url, `/api/checkin/event/${eventID}`);
      // console.log('Response: ', response);

      // Get the data of each Stored Registration Form that belongs to this event
      const regForms = await getRegistrationForms(eventID);
      console.log('Registration Forms:', regForms);
      setEvent(new EventData(title, date, regForms));
    };

    fetchEventData();

    /* return () => {
      // TODO: Abort the fetch request
    }; */
  }, [server_base_url, eventID]);

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-6">
      <h1 className="text-center">{event.title}</h1>

      {event.registrationForms.map((regForm, idx) => (
        <div className="mx-auto w-full h-full justify-center align-center mt-6" key={idx}>
          <h1 className="text-center">{regForm.label}</h1>
        </div>
      ))}
    </div>
  );
};

export default EventPage;
