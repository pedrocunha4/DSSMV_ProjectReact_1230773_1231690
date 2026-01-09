export const isPlanActive = (plan, date = new Date()) => {
  if (!plan) return false;

  const startDate = plan.start || plan.start_date;
  const endDate = plan.end || plan.end_date;

  if (!startDate || !endDate) return false;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const checkDate = new Date(date);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= start && checkDate <= end;
  } catch (error) {
    console.error('Erro ao verificar se plano está ativo:', error);
    return false;
  }
};
export const isPlanActiveToday = (plan) => {
  return isPlanActive(plan, new Date());
};

