/**
 * Validador de CPF (Cadastro de Pessoa Física)
 * Valida o formato e os dígitos verificadores do CPF brasileiro
 */

export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto >= 10 ? 0 : resto;
  
  if (parseInt(cpf.charAt(9)) !== digito1) {
    return false;
  }
  
  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digito2 = resto >= 10 ? 0 : resto;
  
  return parseInt(cpf.charAt(10)) === digito2;
}

/**
 * Formata CPF para o padrão XXX.XXX.XXX-XX
 */
export function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) {
    return cpf;
  }
  
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação do CPF, deixando apenas números
 */
export function limparCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}

