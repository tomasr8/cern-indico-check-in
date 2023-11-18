import {useContext} from 'react';
import {ParticipantFiltersContext} from '../context/ParticipantFilterProvider';

/**
 * A hook to access the SettingsContext. It is just a shorthand for useContext(SettingsContext).
 * @returns {Object} The SettingsContext object
 */
const useParticipantFilters = () => {
  return useContext(ParticipantFiltersContext);
};

export default useParticipantFilters;
