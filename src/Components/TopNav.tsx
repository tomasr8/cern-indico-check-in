import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowSmallLeftIcon} from '@heroicons/react/20/solid';
import Logo from '../assets/logo.png';
import {wait} from '../utils/wait';
import DropdownSettings, {SettingsItem} from './DropdownSettings';
// import { ArrowLeftIcon } from '@heroicons/react/20/solid';

export default function TopNav({
  backBtnText,
  backNavigateTo,
  settingsItems,
}: {
  backBtnText?: string;
  backNavigateTo?: string | number;
  settingsItems?: SettingsItem[];
}) {
  const navigate = useNavigate();
  const {pathname} = useLocation();

  const btnText = backBtnText || '';
  const page = backNavigateTo || '/';

  if (pathname === '/') {
    return (
      <div className="mb-4 flex justify-between p-2">
        <div className="flex h-12 items-center gap-4" onClick={() => navigate('/')}>
          <img src={Logo} alt="Logo" width={48} height={48}></img>
          <span className="whitespace-nowrap text-xl font-semibold text-gray-800 dark:text-gray-200">
            Indico check-in
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-10 mb-4 flex items-center justify-between p-2">
        <button
          type="button"
          className="flex max-w-[60%] cursor-pointer items-center rounded-full transition-all
                     active:bg-gray-300/20 dark:active:bg-blue-700/20"
          onClick={async () => {
            await wait(50);
            // Typescript...
            if (typeof page === 'number') {
              navigate(page);
            } else {
              navigate(page);
            }
          }}
        >
          <ArrowSmallLeftIcon className="w-[2.5rem] min-w-[2.5rem] cursor-pointer text-gray-700 dark:text-gray-300" />
          <span
            className="select-none overflow-hidden text-ellipsis whitespace-nowrap
                       pr-2 font-semibold text-gray-700 dark:text-gray-300"
          >
            {btnText}
          </span>
        </button>
        <div>
          {settingsItems && settingsItems.length > 0 && <DropdownSettings items={settingsItems} />}
        </div>
      </div>
    );
  }
}
