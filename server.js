const {MongoClient, ObjectId} = require("mongodb")
const express = require("express")
const multer = require("multer")
const upload = multer()
const sanitizeHTML = require("sanitize-html")
const fse = require('fs-extra')
const sharp = require ('sharp')
let db
const path = require('path')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const CampaignCard = require("./src/components/CampaignCard").default

fse.ensureDirSync(path.join("public", "uploaded-photos"))

const adNet = express()
adNet.set("view engine","ejs")
adNet.set("views", "./views")
adNet.use(express.static("public"))

adNet.use(express.json())
adNet.use(express.urlencoded({extended: false}))

adNet.get("/fetch", async (req, res) => {
    const campaigns = await db.collection("campaigns").find().toArray()
    const generatedHTML = ReactDOMServer.renderToString(
        <div className="container">
            {!campaigns.length && <p>Não há campanhas cadastradas no momento.</p>}
            <div className="campaign-grid mb-3">
                {campaigns.map(campaign => <CampaignCard key={campaign._id} 
                                                name={campaign.name} 
                                                brand={campaign.brand} 
                                                conversionType={campaign.conversionType} 
                                                bid={campaign.bid} 
                                                target={campaign.target} 
                                                photo={campaign.photo} 
                                                id={campaign._id}
                                                readOnly = {true}
                                            />
                )}
            </div>
        </div>
    )
    res.render("home", { generatedHTML })
})

adNet.get("/advertiser", (req, res) => {
    res.render("advertiser")
})

adNet.get("/api/campaigns", async (req,res) => {
    const campaigns = await db.collection("campaigns").find().toArray()
    res.json(campaigns)
})

adNet.post("/create-campaign", upload.single("photo"), ourCleanup, async (req,res) => {
    if (req.file) {
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844,456).jpeg({quality: 50}).toFile(path.join("public", "uploaded-photos", photofilename))

        req.cleanData.photo = photofilename
    }
    
    console.log(req.body)
    const info = await db.collection("campaigns").insertOne(req.cleanData)
    const newCampaign = await db.collection("campaigns").findOne({_id: new ObjectId(info.insertedId)})

    res.send(newCampaign)
})

adNet.delete("/campaign/:id", async (req, res) =>{
    if (typeof req.params.id != "string") req.params.id = ""
    const doc = await db.collection("campaigns").findOne({_id: new ObjectId(req.params.id)})
    if(doc.photo) {
        fse.remove(path.join("public", "uploaded-photos", doc.photo))
    }

    db.collection("campaigns").deleteOne({_id: new ObjectId(req.params.id)})
    res.send("Apagado com sucesso!")
})

adNet.post("/update-campaign", upload.single("photo", ourCleanup, async (req, res) =>{
    if  (req.file) {
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844,456).jpeg({quality: 50}).toFile(path.join("public", "uploaded-photos", photofilename))

        req.cleanData.photo = photofilename

        const info = await db.collection("campaigns").findOneAndUpdate({_id: new ObjectId(req.body._id)}, {$set: req.cleanData})
        if (info.value.photo) {
            fse.remove(path.join("public","uploaded-photos", info.value.photo))
        }
        
        res.send(photofilename)

    }else{
        db.collection("campaigns").findOneAndUpdate({_id: new ObjectId(req.body._id)}, {$set: req.cleanData})

        res.send(false)
    }
}))

function ourCleanup(req, res, next){
    if (typeof req.body.name != "string") req.body.name = ""
    if (typeof req.body.brand != "string") req.body.brand = ""
    if (typeof req.body.conversionType != "string") req.body.conversionType = ""
    if (typeof req.body.bid != "string") req.body.bid = ""
    if (typeof req.body.target != "string") req.body.target = ""
    if (typeof req.body._id != "string") req.body._id = ""

    req.cleanData = {
        name: sanitizeHTML (req.body.name.trim(), {allowedTags: [], allowedAttributes: {}}),
        brand: sanitizeHTML (req.body.brand.trim(), {allowedTags: [], allowedAttributes: {}}),
        conversionType: sanitizeHTML (req.body.conversionType.trim(), {allowedTags: [], allowedAttributes: {}}),
        bid: sanitizeHTML (req.body.bid.trim(), {allowedTags: [], allowedAttributes: {}}),
        target: sanitizeHTML (req.body.target.trim(), {allowedTags: [], allowedAttributes: {}})

    }

    next()
}

async function start(){
    const client = new MongoClient("mongodb://admin:admin@localhost:27017/AdNetworkDB?&authSource=admin")
    await client.connect()
    db = client.db()
}   


start()
adNet.listen(3000)
