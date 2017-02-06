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

@route("/pets/:petId", method='post')
def postPet():
    """
    @api {post} /pets/:petId /pets/:petId
    @apiName postPet
    @apiGroup pet
    @apiVersion 0.2.0
    @apiDescription Adds a new pet to the store

    @apiParam {String} petId the id of the pet

    @apiParam {String} appKey Application Key to access the API
    @apiParam {String} appSecret Application Key Secret to access the API

    @apiParam {String} name pet's name
    @apiParam {String} [nickname] optional pet's nickname

    @apiSuccess {object} pet pet
    @apiSuccessExample {json} Example 200 Response
      TODO
    """

    return