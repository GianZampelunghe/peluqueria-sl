'use client';

import { Search, Phone, Award } from 'lucide-react';

interface Client {
  id: string;
  fullname: string;
  phone: string;
  cuts_completed: number;
  created_at: string;
}

interface LoyaltyCRMProps {
  clients: Client[];
  loadingCRM: boolean;
  crmSearch: string;
  setCrmSearch: (search: string) => void;
  cutsRequired: number;
  rewardText: string;
  onAdjustCuts: (id: string, currentCuts: number, direction: 'up' | 'down') => void;
}

export default function LoyaltyCRM({
  clients,
  loadingCRM,
  crmSearch,
  setCrmSearch,
  cutsRequired,
  rewardText,
  onAdjustCuts
}: LoyaltyCRMProps) {
  
  const filteredClients = clients.filter(c => 
    c.fullname.toLowerCase().includes(crmSearch.toLowerCase()) || 
    c.phone.includes(crmSearch)
  );

  return (
    <div className="space-y-6">
      {/* Header del CRM y buscador */}
      <div className="bg-[#1A1A1E] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            🏆 CRM Clientes & Tarjeta de Regalo
          </h3>
          <p className="text-xs text-zinc-550">
            Resalta en dorado a los clientes que alcanzan la meta de cortes.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono"
            value={crmSearch}
            onChange={(e) => setCrmSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {/* Listado de Clientes */}
      <div className="bg-[#1A1A1E] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        {loadingCRM ? (
          <div className="text-center py-12">
            <div className="animate-spin h-6 w-6 border-b-2 border-gold mx-auto"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-16 text-zinc-555">
            <span className="text-4xl block mb-2">👥</span>
            <p className="text-sm font-bold">No hay clientes registrados</p>
            <p className="text-xs mt-1">Los clientes aparecerán automáticamente tras agendar un turno.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-zinc-500 uppercase text-[9px] font-black tracking-wider border-b border-zinc-900">
                  <th className="px-5 py-4">Nombre Cliente</th>
                  <th className="px-5 py-4">WhatsApp / Teléfono</th>
                  <th className="px-5 py-4 text-center">Cortes Completados</th>
                  <th className="px-5 py-4 text-right">Estatus VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredClients.map((client) => {
                  const isVip = client.cuts_completed >= cutsRequired;

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-zinc-900/20 transition-all ${
                        isVip ? 'bg-gold/5' : ''
                      }`}
                    >
                      {/* Nombre */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-sm text-white block">
                          {client.fullname}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-medium">
                          Registrado: {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Celular / WhatsApp */}
                      <td className="px-5 py-4">
                        <a
                          href={`https://wa.me/${client.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>+{client.phone}</span>
                        </a>
                      </td>

                      {/* Contador de Cortes (Edición manual) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => onAdjustCuts(client.id, client.cuts_completed, 'down')}
                            className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg border border-zinc-850 flex items-center justify-center cursor-pointer text-xs"
                          >
                            -
                          </button>
                          
                          <span className={`text-base font-extrabold w-6 text-center ${
                            isVip ? 'text-gold' : 'text-zinc-200'
                          }`}>
                            {client.cuts_completed}
                          </span>

                          <button
                            onClick={() => onAdjustCuts(client.id, client.cuts_completed, 'up')}
                            className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg border border-zinc-850 flex items-center justify-center cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Estatus VIP badge */}
                      <td className="px-5 py-4 text-right">
                        {isVip ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="px-2.5 py-0.5 bg-gold/15 border border-gold/30 rounded-full text-[10px] text-gold font-black uppercase flex items-center gap-1 tracking-wider animate-pulse-gold">
                              VIP 🔥
                            </span>
                            <span className="text-[9px] text-zinc-400 mt-1 block font-semibold italic">
                              {rewardText}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider block">
                            Faltan {cutsRequired - client.cuts_completed} cortes
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
