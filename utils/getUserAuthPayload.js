function getUserAuthPayload(user) {
  const {
    surName,
    firstName,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    residentialArea,
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
    areas,
    gender,
    maritalStatus,
    role,
    connectGroup,
    department,
  };
}

module.exports = { getUserAuthPayload };
