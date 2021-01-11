var router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/profile', require('./profile'));
router.use('/contact', require('./contact'));
router.use('/event', require('./event'));
router.use('/chat', require('./chat'));
router.use('/call', require('./call'));
router.use('/album', require('./album'));

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;
        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
