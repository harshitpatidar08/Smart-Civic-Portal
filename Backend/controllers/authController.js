const supabase = require('../config/supabaseClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Register a new user
const register = async (req, res, next) => {
  try {
    const { email, password, name, role, district, state, pincode } = req.body;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'citizen',
          district,
          state,
          pincode
        }
      }
    });

    if (authError) return errorResponse(res, 400, authError.message);

    // 2. Add user to public.users table
    // Supabase trigger usually handles this, but we can do it manually if trigger not set
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id, 
          email, 
          name, 
          role: role || 'citizen', 
          district,
          state,
          pincode
        }
      ]);

    if (userError) return errorResponse(res, 400, userError.message);

    return successResponse(res, 201, 'User registered successfully', { user: authData.user });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return errorResponse(res, 400, error.message);

    return successResponse(res, 200, 'Login successful', { session: data.session, user: data.user });
  } catch (error) {
    next(error);
  }
};

// Get Current User Profile
const getProfile = async (req, res, next) => {
  try {
    // Assuming token is passed and verified by middleware
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return errorResponse(res, 401, 'Unauthorized');

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) return errorResponse(res, 401, error.message);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) return errorResponse(res, 400, userError.message);

    return successResponse(res, 200, 'User profile fetched', userData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
