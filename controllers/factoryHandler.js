const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Module) =>
  catchAsync(async (req, res, next) => {
    const doc = await Module.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Module) =>
  catchAsync(async (req, res, next) => {
    const doc = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Module) => async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newdoc = await Module.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        data: newdoc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    //     const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'No document found with that ID',
      });
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.getAll = (Model) => async (req, res) => {
  try {
    // to allow for nested Get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // excute query

    // send respose
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
