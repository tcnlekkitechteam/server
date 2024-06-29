function getUserAuthPayload(user) {
  const {
    name,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    area,
    gender,
    maritalStatus,
    role,
    department,
  } = user;

  return {
    userId: user._id,
    name,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    area,
    gender,
    maritalStatus,
    role,
    department,
  };
}

module.exports = { getUserAuthPayload };
