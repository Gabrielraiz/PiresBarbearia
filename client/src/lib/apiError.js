export function getApiErrorMessage(error, fallback = 'Erro inesperado') {
  if (!error) return fallback;
  if (error.userMessage) return error.userMessage;
  if (typeof error === 'string') return error;
  return error?.response?.data?.message || error?.message || fallback;
}

export function normalizeApiError(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || 'Erro inesperado';
  if (status === 0 || error?.code === 'ECONNABORTED') {
    return 'Tempo de resposta esgotado. Tente novamente.';
  }
  if (status >= 500) {
    return 'Servidor indisponível no momento. Tente novamente em instantes.';
  }
  if (status === 404) {
    return 'Recurso não encontrado.';
  }
  if (status === 403) {
    return 'Você não tem permissão para esta ação.';
  }
  if (status === 401) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  return message;
}
