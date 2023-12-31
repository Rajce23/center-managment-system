export const FRONT_QUEUE = {
  queueName: 'front_service_queue',
  url: 'amqp://guest:guest@rabbitmq:5672',
  serviceName: 'front_service',
};
export const FRONT_MESSAGES = {
  frontCreate: 'front.create',
  getAllFronts: 'front.getAll',
  getFront: 'front.get',
  deleteFront: 'front.delete',
  updateFrontLength: 'front.updateLength',
  addFrontTasksLength: 'front.addTaskLength',
  getFrontForTask: 'front.getFrontForTask',
  deleteFrontTaskLength: 'front.deleteFrontTaskLength',
  addBestTaskToFront: 'front.addBestTaskToFront',
  updateTimeToCompleteAllTasks: 'front.updateTimeToCompleteAllTasks',
};
