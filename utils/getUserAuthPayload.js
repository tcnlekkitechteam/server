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
    gender,
    maritalStatus,
    role,
    department,
  };
}

module.exports = { getUserAuthPayload };
