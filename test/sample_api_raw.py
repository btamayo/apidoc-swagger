@route("/pets", method='post')
def postPet():
    """
    @api {post} /pets /pets
    @apiName postPet
    @apiGroup pet
    @apiVersion 0.2.0
    @apiDescription Adds a new pet to the store
      This is multiline description.

    @apiParam {String} appKey Application Key to access the API
    @apiParam {String} appSecret Application Key Secret to access the API

    @apiParam {String} name pet's name
    @apiParam {String} nickname pet's nickname

    @apiSuccess {String} petId newly created pet's id
    @apiSuccessExample {json} Example 200 Response
        HTTP/1.1 200 OK
        {"petId":"ecd736e50e60410d82390ba21b397fb0"}

    @apiExample {curl} Sample Request:
      TODO
    """

    return

@route("/pets/:petId")
def getPet():
    """
    @api {get} /pets/:petId /pets/:petId
    @apiName getPet
    @apiGroup pet
    @apiVersion 0.2.0
    @apiDescription Returns the pet object at this id

    @apiParam {String} petId the id of the pet

    @apiParam {String} appKey Application Key to access the API
    @apiParam {String} appSecret Application Key Secret to access the API

    @apiSuccess {object} pet pet
    @apiSuccessExample {json} Example 200 Response
      TODO
    """

    return

@route("/pets/:petId" method='put')
def updatePet():
    """
    @api {put} /pets/:petId /pets/:petId
    @apiName updatePet
    @apiGroup pet
    @apiVersion 0.2.0
    @apiDescription updates pet

    @apiParam {String} petId id of pet to update

    @apiParam {String} [appKey] Application Key to access the API
    @apiParam {String} [appSecret] Application Key Secret to access the API

    @apiParam {String} petUpdate update
    @apiParam {String} petUpdateField update

    @apiSuccess {String} petId petId
    @apiSuccessExample {json} Example 200 Response
      TODO
    """
    return
