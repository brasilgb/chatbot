import express from 'express'
import whatsappController from '../controllers/whatsappController.js'

const router = express.Router()

router.get('/webhook', (req, res) => whatsappController.verify(req, res))
router.post('/webhook', (req, res) => whatsappController.webhook(req, res))

export default router
