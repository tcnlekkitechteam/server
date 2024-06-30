function getUserAuthPayload(user) {
  const {
    surName,
    firstName,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    area,
    gender,
    maritalStatus,
    role,
    connectGroup,
    department,
  } = user;

  return {
    userId: user._id,
    surName,
    firstName,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    area,
    gender,
    maritalStatus,
    role,
    connectGroup,
    department,
  };
}

module.exports = { getUserAuthPayload };
