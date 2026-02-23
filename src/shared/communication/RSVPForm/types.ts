export interface RSVPData {
  attending: boolean;
  name: string;
  email: string;
  phone?: string;
  guests?: number;
  dietary?: string[];
  message?: string;
  plusOne?: string;
}

export interface RSVPFormConfig {
  eventName: string;
  eventDate?: string;
  fields: Array<'name' | 'email' | 'phone' | 'guests' | 'dietary' | 'message' | 'plusOne'>;
  dietaryOptions?: string[];
  maxGuests?: number;
  onSubmit: (data: RSVPData) => void;
  successMessage?: string;
  declineOption?: boolean;
}
