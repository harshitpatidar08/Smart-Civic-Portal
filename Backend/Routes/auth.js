router.post("./register" , async(req , res) => {
    const {name , email , password} = req.body;

    const {data , error} = await supabase
    .from("users")
    .insert([{name,email,password,role:"citizen"}]);

    if(error) return res.status(400).json(error);

    res.json(data);
})