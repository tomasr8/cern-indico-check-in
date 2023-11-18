import {ReactNode, createContext, useState} from 'react';
import PropTypes from 'prop-types';
import {Filters, makeDefaultFilterState} from '../Components/Tailwind/filters';
import {SearchData} from '../Components/Tailwind/Table';

interface UpdateProps extends SearchData {
  regformId: number;
}

interface ParticipantFiltersContextProps {
  regformId: number;
  searchValue: string;
  filters: Filters;
  clear: () => void;
  update: (v: UpdateProps) => void;
}

export const ParticipantFiltersContext = createContext<ParticipantFiltersContextProps>({
  regformId: 1,
  searchValue: '',
  filters: makeDefaultFilterState(),
  clear: () => {},
  update: () => {},
});

export const ParticipantFiltersProvider = ({children}: {children: ReactNode}) => {
  const [regformId, setRegformId] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState(makeDefaultFilterState());

  const clear = () => {
    setSearchValue('');
    setFilters(makeDefaultFilterState());
  };

  const update = ({regformId, searchValue, filters}: UpdateProps) => {
    setRegformId(regformId);
    setSearchValue(searchValue);
    setFilters(filters);
  };

  return (
    <ParticipantFiltersContext.Provider value={{regformId, searchValue, filters, clear, update}}>
      {children}
    </ParticipantFiltersContext.Provider>
  );
};

ParticipantFiltersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
