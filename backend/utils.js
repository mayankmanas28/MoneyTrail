const calculateNextDueDate = (currentDate, frequency) => {
    const date = new Date(currentDate);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }

    let nextDueDate = new Date(date);

    switch (frequency) {
        case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
        case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
        case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
        case 'annually':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    return nextDueDate;
};

module.exports = { calculateNextDueDate };