const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    w2media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    childrenChurch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pastoralCareTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    trafficControl: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ushering: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    technicalAndSound: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    praiseTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teensChurch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    infoDesk: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    venueManagement: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    medicalTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sundaySchool: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    camera: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    baptismal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    contentAndSocialMedia: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Department', departmentSchema);