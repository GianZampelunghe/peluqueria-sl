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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-blue-sl uppercase tracking-wider">
            🏆 CRM Clientes & Tarjeta de Regalo
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Se resalta en rojo a los clientes que alcanzan la meta de cortes.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono"
            value={crmSearch}
            onChange={(e) => setCrmSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-blue-sl focus:outline-none"
          />
        </div>
      </div>

      {/* Listado de Clientes */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loadingCRM ? (
          <div className="text-center py-12">
            <div className="animate-spin h-6 w-6 border-b-2 border-blue-sl mx-auto"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <span className="text-4xl block mb-2">👥</span>
            <p className="text-sm font-bold text-slate-700">No hay clientes registrados</p>
            <p className="text-xs mt-1">Los clientes aparecerán automáticamente tras agendar un turno.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-200">
                  <th className="px-5 py-4">Nombre Cliente</th>
                  <th className="px-5 py-4">WhatsApp / Teléfono</th>
                  <th className="px-5 py-4 text-center">Cortes Completados</th>
                  <th className="px-5 py-4 text-right">Estatus VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const isVip = client.cuts_completed >= cutsRequired;

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-50/50 transition-all ${
                        isVip ? 'bg-rojo-sl/5' : ''
                      }`}
                    >
                      {/* Nombre */}
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-sm text-blue-sl block">
                          {client.fullname}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">
                          Registrado: {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Celular / WhatsApp */}
                      <td className="px-5 py-4">
                        <a
                          href={`https://wa.me/${client.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600"
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
                            className="w-7 h-7 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer text-xs"
                          >
                            -
                          </button>
                          
                          <span className={`text-base font-black w-6 text-center ${
                            isVip ? 'text-rojo-sl' : 'text-slate-800'
                          }`}>
                            {client.cuts_completed}
                          </span>

                          <button
                            onClick={() => onAdjustCuts(client.id, client.cuts_completed, 'up')}
                            className="w-7 h-7 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Estatus VIP badge */}
                      <td className="px-5 py-4 text-right">
                        {isVip ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="px-2.5 py-0.5 bg-rojo-sl/10 border border-rojo-sl/20 rounded-full text-[10px] text-rojo-sl font-black uppercase flex items-center gap-1 tracking-wider animate-pulse-rojo">
                              VIP 🔥
                            </span>
                            <span className="text-[9px] text-blue-sl mt-1 block font-bold italic">
                              {rewardText}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">
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
