function getUserAuthPayload(user) {
  const {
    name,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    gender,
    maritalStatus,
    role,
  } = user;

  return {
    userId: user._id,
    name,
    email,
    phoneNumber,
    birthDay,
    ageGroup,
    industry,
    gender,
    maritalStatus,
    role,
  };
}

module.exports = { getUserAuthPayload };
