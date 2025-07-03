const asyncHandler = (func) =>{
  return async (req,res,next)=>{
        try {

            await func(req,res,next)
            
        } catch (error) {
            res
            .status( 300)
            .json({
                success: false,
                msg: error.message
            })
        }
    }
}

export {asyncHandler}