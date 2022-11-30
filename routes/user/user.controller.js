const User = require("../../models/User");
const { v4: uuidv4 } = require("uuid");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../../errors");
const { StatusCodes } = require("http-status-codes");
const path = require("path");
const { findOne, findOneAndUpdate } = require("../../models/User");

const completeProfile = async (req, res) => {
  const { _id } = req.user;
  const tags = req.body.tags.split(",");

  if (tags.length > 4) {
    throw new BadRequestError("You can only choose 4 categories");
  }

  if (req.files === null) {
    throw new BadRequestError("Please upload your image");
  }

  const userImage = req.files.image;
  if (!userImage.mimetype.includes("image")) {
    throw new BadRequestError("Please upload a valid image");
  }

  // max upload is 2 megabytes
  const maxSize = 2000000;

  if (userImage.size > maxSize) {
    throw new BadRequestError("Exceeded allowed image max size");
  }

  let imageId = `${uuidv4()}-${req.body.firstname}`;

  const imagePath = path.join(
    __dirname,
    "../../uploads/" + `${imageId}-${userImage.name}`
  );

  const userVerified = await User.findById(_id);

  if (userVerified == null) {
    throw new NotFoundError(`User with id ${_id}, not found`);
  }

  // To be sure that user has verified it's email
  if (userVerified.isVerified !== true) {
    throw new UnauthenticatedError("You have not verified your email");
  }

  await userImage.mv(imagePath);

  req.body.completed = true;
  req.body.image = `uploads/${imageId}-${userImage.name}`;
  req.body.tags = tags;

  const user = await User.findByIdAndUpdate(userVerified._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Profile completed",
    user,
  });
};

const getMe = (req, res) => {
  res.status(StatusCodes.OK).json({
    status: true,
    message: "User data",
    user: req.user,
  });
};

const updateProfileBasic = async (req, res) => {
  const { email, firstname, lastname, phone_number } = req.body;
  const userObj = {};
  if (email) {
    const isEmailExist = await User.findOne({ email });
    console.log(isEmailExist);
    if (email === req.user.email) {
      userObj.email = email;
    } else if (isEmailExist) {
      throw new BadRequestError("Email is not avaliable");
    } else {
      userObj.email = email;
    }
  }
  if (firstname) {
    userObj.firstname = firstname;
  }
  if (lastname) {
    userObj.lastname = lastname;
  }
  if (phone_number) {
    userObj.phone_number = phone_number;
  }

  const user = await User.findByIdAndUpdate(req.user._id, userObj, {
    new: true,
    runValidators: true,
  });

  console.log(user);

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Updated",
    user: req.body,
  });
};

const updateTags = async (req, res) => {
  let { tags } = req.body;
  tags = tags.split(",");
  console.log(121,tags)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { tags },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Updated",
    user: tags,
  });
};

module.exports = { completeProfile, getMe, updateProfileBasic, updateTags };
