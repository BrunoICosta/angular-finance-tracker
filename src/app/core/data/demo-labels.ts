import { AppLang } from '../i18n/language';

/**
 * Demo data and default categories are user data once saved, so they are generated in the
 * language active at that moment (and keep that text afterwards, like anything the person typed).
 * Portuguese is the source; this maps it to English.
 */
const EN: Readonly<Record<string, string>> = {
  // Default categories
  Salário: 'Salary',
  Freelance: 'Freelance',
  Investimentos: 'Investments',
  'Outras receitas': 'Other income',
  Moradia: 'Housing',
  Alimentação: 'Food',
  Transporte: 'Transportation',
  Saúde: 'Health',
  Lazer: 'Leisure',
  Educação: 'Education',
  Assinaturas: 'Subscriptions',
  Compras: 'Shopping',
  'Outras despesas': 'Other expenses',
  // Demo transactions
  'Projeto freelance': 'Freelance project',
  'Rendimento CDB': 'CD interest',
  Aluguel: 'Rent',
  Condomínio: 'Building fees',
  'Conta de luz': 'Electricity bill',
  'Internet fibra': 'Fiber internet',
  'Streaming de vídeo': 'Video streaming',
  'Streaming de música': 'Music streaming',
  Supermercado: 'Groceries',
  Delivery: 'Food delivery',
  Combustível: 'Fuel',
  'Transporte por app': 'Ride sharing',
  Cinema: 'Movies',
  'Bar com amigos': 'Drinks with friends',
  Farmácia: 'Pharmacy',
  Roupas: 'Clothes',
  'Curso online': 'Online course',
  'Ingressos para show': 'Concert tickets',
  'Dois ingressos, pista': 'Two tickets, general admission',
  'Consulta odontológica': 'Dentist appointment',
  'Limpeza semestral': 'Six-month cleaning',
  'Fone de ouvido': 'Headphones',
};

/** Returns the demo text in the given language (Portuguese source text as fallback). */
export function demoLabel(text: string, lang: AppLang): string {
  return lang === 'en' ? (EN[text] ?? text) : text;
}
