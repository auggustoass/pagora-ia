
import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Por que o HBlackPix é melhor que plataformas caras e complicadas?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare e veja por que estamos revolucionando o mercado de cobranças automatizadas.
          </p>
        </div>
        
        <div className="glass-card max-w-4xl mx-auto overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-xl">Recursos</th>
                  <th className="p-4 text-center font-medium text-xl text-primary">HBlackPix</th>
                  <th className="p-4 text-center font-medium text-xl text-muted-foreground">Outras plataformas</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium">WhatsApp automático</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Check className="h-6 w-6 text-[#aaff00]" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium">IA para cobrança</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Check className="h-6 w-6 text-[#aaff00]" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium">Link Pix avulso ou recorrente</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Check className="h-6 w-6 text-[#aaff00]" />
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm">
                    Parcial
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium">Comissão por recebimento</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <X className="h-6 w-6 text-[#aaff00]" />
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm">
                    3% a 7%
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-muted/10">
                  <td className="p-4 font-medium">Integração com Mercado Pago</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Check className="h-6 w-6 text-[#aaff00]" />
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm">
                    Parcial
                  </td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-4 font-medium">Preço fixo e justo</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <Check className="h-6 w-6 text-[#aaff00]" />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <X className="h-6 w-6 text-red-500" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
