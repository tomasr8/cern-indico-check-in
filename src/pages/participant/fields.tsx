import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Typography} from '../../Components/Tailwind';
import {getEvent} from '../../db/db';
import {getRegistrationFile} from '../../utils/client';
import {formatDatetime} from '../../utils/date';

export interface FieldProps {
  id: number;
  title: string;
  description: string;
  inputType: string;
  data: any;
  defaultValue: any;
  price?: number;
}

export interface Section {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

interface Choice {
  id: string; // uuid
  caption: string;
}

interface ChoiceFieldProps extends FieldProps {
  choices: Choice[];
}

interface Country {
  countryKey: string; // uuid
  caption: string;
}

interface CountryFieldProps extends FieldProps {
  choices: Country[];
}

interface FileFieldProps extends FieldProps {
  fileData: FileData;
}

interface PictureFieldProps extends FileFieldProps {}

interface FileData {
  filename: string;
  size: number;
  url: string;
}

export function Field(field: FieldProps) {
  switch (field.inputType) {
    case 'text':
    case 'number':
    case 'email':
    case 'phone':
    case 'bool':
      return <TextField {...field} />;
    case 'textarea':
      return <TextAreaField {...field} />;
    case 'date':
      return <DateField {...field} />;
    case 'checkbox':
      return <CheckboxField {...field} />;
    case 'file':
      return <FileField {...(field as FileFieldProps)} />;
    case 'picture':
      return <PictureField {...(field as PictureFieldProps)} />;
    case 'country':
      return <CountryField {...(field as CountryFieldProps)} />;
    case 'single_choice':
      return <SingleChoiceField {...(field as ChoiceFieldProps)} />;
    case 'multi_choice':
      return <MultiChoiceField {...(field as ChoiceFieldProps)} />;
    case 'accommodation':
      return <AccommodationField {...(field as ChoiceFieldProps)} />;
    case 'accompanying_persons':
      return <AccompanyingPersonsField {...field} />;
    default:
      console.warn('Unhandled field', field);
      return null;
  }
}

function FieldHeader({title, description}: {title: string; description: string}) {
  return (
    <>
      <Typography variant="body2" className="font-bold">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" className="mb-1 italic text-gray-600 dark:text-gray-400">
          {description}
        </Typography>
      )}
    </>
  );
}

function TextField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{data}</Typography>
    </div>
  );
}

function TextAreaField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1" className="whitespace-pre-line">
        {data}
      </Typography>
    </div>
  );
}

function DateField({title, description, data}: FieldProps) {
  const date = data ? formatDatetime(data) : '';
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{date}</Typography>
    </div>
  );
}

function CheckboxField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{data ? 'yes' : 'no'}</Typography>
    </div>
  );
}

function FileField({title, description, fileData}: FileFieldProps) {
  const {id} = useParams();

  async function downloadFile() {
    if (!id) {
      return;
    }

    const event = await getEvent(parseInt(id, 10));
    if (!event) {
      return;
    }
    const response = await getRegistrationFile(event.serverId, fileData.url);
    if (!response.ok) {
      return;
    }

    var blob = new Blob([response.data]);

    var dlink = document.createElement('a');
    dlink.download = fileData.filename;
    dlink.href = window.URL.createObjectURL(blob);
    dlink.onclick = function (e) {
      // revokeObjectURL needs a delay to work properly
      setTimeout(function () {
        window.URL.revokeObjectURL(dlink.href);
      }, 1500);
    };

    dlink.click();
    dlink.remove();

    // if (response.ok) {
    //   setImageData(`data:image/png;base64, ${toBase64(response.data)}`);
    // }
  }

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">
        <button type="button" onClick={downloadFile} className="text-blue-600 underline">
          {fileData.filename}
        </button>
        {/* <a href=>{fileData.filename}</a> */}
      </Typography>
    </div>
  );
}

function PictureField({title, description, fileData}: PictureFieldProps) {
  const {id} = useParams();
  const [imageData, setImageData] = useState<string>('');

  function toBase64(buf: ArrayBuffer): string {
    const arr = new Uint8Array(buf);
    return window.btoa(arr.reduce((data: any, byte: any) => data + String.fromCharCode(byte), ''));
  }

  useEffect(() => {
    async function fetchImage() {
      if (!id) {
        return;
      }

      const event = await getEvent(parseInt(id, 10));
      if (!event) {
        return;
      }
      const response = await getRegistrationFile(event.serverId, fileData.url);
      if (response.ok) {
        setImageData(`data:image/png;base64, ${toBase64(response.data)}`);
      }
    }
    fetchImage();
  }, [id, fileData.url, setImageData]);

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">
        <img src={imageData} alt={fileData.filename} />
      </Typography>
    </div>
  );
}

function SingleChoiceField({title, description, choices, data}: ChoiceFieldProps) {
  // data: {[uuid]: [number_of_choices]}
  const selected = Object.keys(data)[0];

  // nothing selected
  if (selected === undefined) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
      </div>
    );
  }

  const amount = data[selected];
  const caption = choices.find(choice => choice.id === selected)?.caption;

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">
        {caption}: {amount}
      </Typography>
    </div>
  );
}

function CountryField({title, description, choices, data}: CountryFieldProps) {
  // nothing selected
  if (!data) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
      </div>
    );
  }

  const country = choices.find(choice => choice.countryKey === data)?.caption;
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{country}</Typography>
    </div>
  );
}

function MultiChoiceField({title, description, choices, data}: ChoiceFieldProps) {
  // data: {[uuid]: [number_of_choices]}
  const selected = Object.entries(data).map(([id, amount]) => ({
    id,
    caption: choices.find(choice => choice.id === id)?.caption,
    amount,
  }));

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography as="div" variant="body1">
        <ul className="list-inside list-disc">
          {selected.map(({id, caption, amount}) => (
            <li key={id}>
              <>
                {caption}: {amount}
              </>
            </li>
          ))}
        </ul>
      </Typography>
    </div>
  );
}

function AccommodationField({title, description, choices, data}: ChoiceFieldProps) {
  // nothing selected
  if (data.isNoAccommodation || !data.choice) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
        <Typography variant="body1">No accommodation</Typography>
      </div>
    );
  }

  const choice = choices.find(choice => choice.id === data.choice)!;
  const {caption} = choice;
  const {arrivalDate, departureDate} = data;

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography as="div" variant="body1">
        <ul>
          <li>Arrival: {formatDatetime(arrivalDate)}</li>
          <li>Departure: {formatDatetime(departureDate)}</li>
          <li>Accommodation: {caption}</li>
        </ul>
      </Typography>
    </div>
  );
}

export interface AccompanyingPersonsFieldData {
  id: string;
  firstName: string;
  lastName: string;
}

interface AccompanyingPersonsFieldProps extends FieldProps {
  data: AccompanyingPersonsFieldData[];
}

function AccompanyingPersonsField({title, description, data}: AccompanyingPersonsFieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography as="div" variant="body1">
        <ul className="list-inside list-disc">
          {data.map(({id, firstName, lastName}) => (
            <li key={id}>
              {firstName} {lastName}
            </li>
          ))}
        </ul>
      </Typography>
    </div>
  );
}

export function getAccompanyingPersons(sections: Section[]) {
  const persons = [];
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.inputType === 'accompanying_persons') {
        persons.push(...field.data);
      }
    }
  }
  return persons;
}
