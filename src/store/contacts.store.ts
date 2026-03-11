import { create } from 'zustand';

interface Contact {
    id: string;
    name: string;
    phone: string;
    messageSent: boolean;
    active: boolean;
    attempts: number;
}

interface ContactsState {
    contacts: Contact[];
    loading: boolean;
    fetchContacts: () => Promise<void>;
    addContact: (contact: Partial<Contact>) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set) => ({
    contacts: [],
    loading: false,
    fetchContacts: async () => {
        set({ loading: true });
        try {
            // Mock for now until API integration
            set({ contacts: [], loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },
    addContact: async (contact: Partial<Contact>) => {
        // API call here
    },
}));
