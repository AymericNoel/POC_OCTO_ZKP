import { GardenStatus } from './Enum';

/**
 * Function to get string garden status from query parameters
 * @param {string} params - gardens retrieved from blockchain
 */
const getGardenStatusFromQueryParams = (params) => {
  try {
    const status = params.replace('?status=', '');
    return GardenStatus[status];
  } catch (error) {
    return '';
  }
};

export default getGardenStatusFromQueryParams;
