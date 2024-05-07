import {ArrowDownOnSquareIcon} from '@heroicons/react/24/outline';
import {Typography} from '../Components/Tailwind';
import TopNav from '../Components/TopNav';

export default function Installation() {
  return (
    <>
      <TopNav backBtnText="Installation" backNavigateTo={-1} />
      <div className="flex max-w-xl flex-col items-center gap-10 p-4 text-center">
        <InstallationHeader />
        <InstallationOptions />
      </div>
    </>
  );
}

function InstallationHeader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ArrowDownOnSquareIcon className="h-16 w-16 text-gray-200 dark:text-gray-200" />
      <Typography variant="h3">
        This app is currently not installed. For a more native experience, you can install it on
        your device
      </Typography>
    </div>
  );
}

function InstallationOptions() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Typography variant="h2">Android</Typography>
        <Typography variant="body1">
          Go to your browser settings and click on <b>Install App</b>.{' '}
          <a
            className="text-blue-500 dark:text-blue-500"
            href="https://support.google.com/chrome/answer/9658361"
          >
            Learn more.
          </a>
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        <Typography variant="h2">iOS</Typography>
        <Typography variant="body1">
          Click on the <b>Share</b> icon and select <b>Add to Home Screen</b>
        </Typography>
      </div>
    </div>
  );
}
