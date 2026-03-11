import React from 'react';

interface Contact {
    id: string;
    name: string;
    phone: string;
    status: string;
}

interface ContactsTableProps {
    contacts: Contact[];
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-800">
                        <th className="py-4 px-4 font-medium text-slate-400">Nombre</th>
                        <th className="py-4 px-4 font-medium text-slate-400">Teléfono</th>
                        <th className="py-4 px-4 font-medium text-slate-400">Estado</th>
                        <th className="py-4 px-4 font-medium text-slate-400 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                            <td className="py-4 px-4">{contact.name}</td>
                            <td className="py-4 px-4">{contact.phone}</td>
                            <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contact.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                    {contact.status === 'sent' ? 'Enviado' : 'Pendiente'}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <button className="text-slate-400 hover:text-white transition-colors ml-2">Editar</button>
                            </td>
                        </tr>
                    ))}
                    {contacts.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-500 italic">
                                No hay contactos disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ContactsTable;
