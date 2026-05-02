/**
 * @description Sanitiza um valor de texto para prevenir CSV Injection (Macro Injection).
 * Se o valor começar com caracteres sensíveis (=, +, -, @), adiciona um apóstrofo
 * no início para forçar planilhas (como Excel) a tratarem o conteúdo como texto puro.
 *
 * @param {string | number | null | undefined} value - Valor a ser sanitizado
 * @returns {string} String segura para inserção em CSV
 */
function sanitizeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const strValue = String(value);

  /** Caracteres sensíveis que disparam execução de fórmula em Excel/Sheets */
  const sensitiveChars = ['=', '+', '-', '@'];
  if (sensitiveChars.some((char) => strValue.startsWith(char))) {
    return `'${strValue}`;
  }

  /** Escapa aspas duplas dobrando-as, conforme padrão RFC 4180 */
  const escapedQuotes = strValue.replace(/"/g, '""');
  return `"${escapedQuotes}"`;
}

/**
 * @description Exporta um array de objetos para um arquivo CSV e dispara o download no navegador.
 * Seguro contra CSV Injection e executado 100% no cliente.
 *
 * @param {Record<string, string | number | null | undefined>[]} data - Array de objetos representando as linhas
 * @param {string} filename - Nome desejado para o arquivo (sem o .csv)
 */
export function exportToCsv(
  data: Record<string, string | number | null | undefined>[],
  filename: string,
) {
  if (!data || !data.length) return;

  /** Extrai os cabeçalhos das chaves do primeiro objeto */
  const headers = Object.keys(data[0]);

  // Monta as linhas sanitizadas
  const csvContent = [
    /** Linha 1: Cabeçalhos */
    headers.map(sanitizeCsvValue).join(';'),
    /** Linha 2+: Dados */
    ...data.map((row) =>
      headers.map((header) => sanitizeCsvValue(row[header])).join(';'),
    ),
  ].join('\r\n'); /** \r\n é padrão para quebras de linha em CSV */

  /** Para garantir suporte a acentos no Excel, adicionamos o BOM (Byte Order Mark) do UTF-8 */
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  /** Cria um link temporário para forçar o download no navegador */
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
