const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Chronicle = require('../models/Chronicle')

// @desc   Show add page
// @route  GET /
router.get('/add', ensureAuth, (req, res) => {
    res.render('chronicles/add')
})

// @desc   Process the add form
// @route  GET /
router.post('/', ensureAuth, async (req, res) => {
    try{
       req.body.user = req.user.id 
       await Chronicle.create(req.body)
       res.redirect('/dashboard') 
    }catch (err){
        console.error(err)
        res.render('error/500')
    }
})

// @desc   Show all chronicles
// @route  GET /chronicles/add
router.get('/', ensureAuth, async (req, res) => {
    try{
        const chronicles = await Chronicle.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()

        res.render('chronicles/index', {
          chronicles,   
        })
    } catch(err){
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Show single chronicle
// @route   GET /chronicles/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
      let chronicle = await Chronicle.findById(req.params.id).populate('user').lean()
  
      if (!chronicle) {
        return res.render('error/404')
      }
  
      if (chronicle.user._id != req.user.id && chronicle.status == 'private') {
        res.render('error/404')
      } else {
        res.render('chronicles/show', {
          chronicle,
        })
      }
    } catch (err) {
      console.error(err)
      res.render('error/404')
    }
  })

// @desc   Show edit page
// @route  GET /chronicles/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const chronicle = await Chronicle.findOne({
            _id: req.params.id
        }).lean()
    
        if (!chronicle){
            return res.render('error/404')
        }
    
        if (chronicle.user != req.user.id){
            res.redirect('/chronicles')
        }else{
            res.render('chronicles/edit', {
                chronicle,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc   Update Chronicle
// @route  PUT /chronicles/:id
router.put('/:id', ensureAuth, async(req, res) => {
    try{
        let chronicle = await Chronicle.findById(req.params.id).lean()

    if (!chronicle){
        return res.render('error/404')
    }

    if (chronicle.user != req.user.id){
        res.redirect('/chronicles')
    }else{
       chronicle = await Chronicle.findOneAndUpdate({_id: req.params.id}, req.body, {
           new: true,
           runValidators: true,
       })

       res.redirect('/dashboard')
    }
    } catch (err){
        console.error(err)
        return res.render('error/500')
    }
    
})

// @desc   Delete Chronicle
// @route  DELETE /chronicles/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try{
        await Chronicle.remove({_id: req.params.id})
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// @desc    User chronicles
// @route   GET /chronicles/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
      const chronicles = await Chronicle.find({
        user: req.params.userId,
        status: 'public',
      })
        .populate('user')
        .lean()
  
      res.render('chronicles/index', {
        chronicles,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })



module.exports = router 