const express = require('express');
const router = express.Router();
const EventsController = require('../../controllers/eventsController');
const verifyRoles = require("../../middlewares/verifyRoles");
const ROLES_LIST = require("../../config/roles_list");



router.post('/', verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), EventsController.createEvent);
router.get('/', EventsController.getAllEvents);
router.get('/categories', EventsController.getEventsByCategory);
router.get('/recent', EventsController.getRecentEvents);
router.get('/upcoming', EventsController.getUpcomingEvents);
router.get('/registerEvent', EventsController.registerEvent);
router.get('/today', EventsController.getTodayEvents);
router.get('/:id', EventsController.getEventsById);
router.delete('/:id', EventsController.DeleteEventsById);
router.put('/:id', verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), EventsController.updateEvent);
router.get('/event-health-check', (req, res) => {
    res.status(200).json({ success: 'API is healthy' });
});

module.exports = router;