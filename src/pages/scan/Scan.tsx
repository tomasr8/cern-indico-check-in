import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {VideoCameraSlashIcon} from '@heroicons/react/20/solid';
import {ArrowUpTrayIcon} from '@heroicons/react/24/solid';
import QrScannerPlugin, {scanFile} from '../../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../../Components/Tailwind';
import LoadingBanner from '../../Components/Tailwind/LoadingBanner';
import TopNav from '../../Components/TopNav';
import {useHandleError} from '../../hooks/useError';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {camelizeKeys} from '../../utils/case';
import {useIsOffline} from '../../utils/client';
import {validateEventData, parseQRCodeParticipantData} from '../Auth/utils';
import {handleEvent, handleParticipant} from './scan';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const {autoCheckin} = useSettings();
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const handleError = useHandleError();
  const offline = useIsOffline();

  async function processCode(decodedText: string) {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    let scannedData;
    try {
      scannedData = JSON.parse(decodedText);
    } catch (e: any) {
      handleError(e, 'Error parsing the QRCode data');
      return;
    }

    scannedData = camelizeKeys(scannedData);
    if (validateEventData(scannedData)) {
      if (offline) {
        errorModal({
          title: 'You are offline',
          content: 'Internet connection is required to add a registration form',
        });
        return;
      }

      try {
        await handleEvent(scannedData, errorModal, navigate);
      } catch (e: any) {
        handleError(e, 'Error processing QR code');
      }
      return;
    }

    const parsedData = parseQRCodeParticipantData(scannedData);
    if (parsedData) {
      try {
        await handleParticipant(parsedData, errorModal, handleError, navigate, autoCheckin);
      } catch (e: any) {
        handleError(e, 'Error processing QR code');
      }
    } else {
      errorModal({
        title: 'QR code data is not valid',
        content: 'Some fields are missing. Please try again',
      });
    }
  }

  const onScanResult = async (decodedText: string, _decodedResult: any) => {
    try {
      await processCode(decodedText);
    } catch (e: any) {
      handleError(e, 'Error processing QR code');
    } finally {
      setProcessing(false);
    }

    // TODO: Make QR Code UI More responsive to what is happening
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const decodedText = await scanFile(file);
      // console.log(decodedText);
      onScanResult(decodedText, null);
    } catch (e: any) {
      handleError(e, 'Error processing QR code');
    }
  };

  return (
    <div>
      <TopNav backBtnText="Scan" backNavigateTo={-1} />
      {!processing && process.env.NODE_ENV !== 'production' && (
        <div className="mb-[3rem] mt-[1rem] flex justify-center">
          <FileUploadScanner onFileUpload={onFileUpload} />
        </div>
      )}
      {!processing && (
        <div className="mt-[-1rem]">
          <QrScannerPlugin qrCodeSuccessCallback={onScanResult} onPermRefused={onPermRefused} />
        </div>
      )}
      {processing && <LoadingBanner text="Loading.." />}
      {!hasPermission && (
        <div className="mx-4 mt-2 rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center gap-2 px-6 pb-12 pt-10">
            <VideoCameraSlashIcon className="w-20 text-gray-500" />
            <Typography variant="h3" className="text-center">
              Please give permission to access the camera and refresh the page
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}

function FileUploadScanner({
  onFileUpload,
}: {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <input id="qr-file" type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
      <label
        htmlFor="qr-file"
        className="fit-content flex h-fit gap-2 justify-self-center rounded-lg bg-primary
  px-4 py-3 text-sm font-medium text-white focus:outline-none active:bg-blue-800 dark:bg-blue-600 dark:active:bg-blue-700"
      >
        <ArrowUpTrayIcon className="h-6 w-6" />
        <span className="ml-2">Upload QR code image</span>
      </label>
      <div id="file-upload"></div>
    </>
  );
}
