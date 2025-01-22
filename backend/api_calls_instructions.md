Below is **example Node.js** code that demonstrates a possible approach to implementing your **AI Thumbnail Generator** backend workflows with Supabase. It’s written in a simplified **Express.js** style for clarity, but you can adapt it to Nest.js, Next.js API routes, or any other Node framework. The code focuses on **key database operations** (sign-up, referral, uploading face images, generating thumbnails, buying credits, subscriptions) using the **Supabase JS client**.

> **Note**: This is **sample code**. In production, you would add **error handling**, **authentication guards**, **validation**, and **security checks**. The goal here is to illustrate each major step in your workflow.

---

## 1. Set Up the Supabase Client

Create a file, e.g., `supabase.js`:
```js
// supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

In your main server file, you can import this:

```js
// server.js (or app.js)
import express from 'express'
import { supabase } from './supabase.js' // your supabase client
import { v4 as uuidv4 } from 'uuid'      // for generating any random codes, if needed

const app = express()
app.use(express.json()) // parse JSON bodies
```

---

## 2. Sign Up & Create Profile

When a user signs up, you do two things:

1. Create the user via **Supabase Auth**.
2. Create a corresponding row in the **`profiles`** table with initial credits and a unique referral code.

### Example: `POST /signup`
```js
app.post('/signup', async (req, res) => {
  try {
    const { email, password, referral } = req.body
    // 1) Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      return res.status(400).json({ error: error.message })
    }

    const user = data.user
    if (!user) {
      return res.status(400).json({ error: 'No user returned from signUp' })
    }

    // 2) Create a profile
    // Generate a random referral code for this new user
    const myReferralCode = 'REF-' + uuidv4().split('-')[0].toUpperCase()
    
    // If the user was referred by someone, we store referral in `referred_by`
    // We'll also add initial credits, e.g., 50
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        credits: 50,
        referral_code: myReferralCode,
        referred_by: referral || null  // e.g., if referral is "REFCODEABC"
      })
      .single()

    if (profileError) {
      // if there's an error, you might want to delete the user from auth to keep data in sync
      return res.status(400).json({ error: profileError.message })
    }

    // 3) If there's a referral code provided, reward the referrer
    if (referral) {
      // find who owns that referral code
      const { data: referrerProfiles, error: referrerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', referral)
        .single()
      
      if (!referrerError && referrerProfiles) {
        // add bonus, e.g., +30 credits
        await supabase
          .from('profiles')
          .update({ credits: referrerProfiles.credits + 30 })
          .eq('id', referrerProfiles.id)
      }
    }

    return res.status(201).json({ userId: user.id, profile: profileData })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
```

---

## 3. Upload Face Image

Users can upload a face photo. You’ll typically **upload** the file to **Supabase Storage** or another bucket, then store the **URL** in the `user_images` table.

### Example: `POST /upload-face`
```js
app.post('/upload-face', async (req, res) => {
  try {
    const { userId, base64Image } = req.body
    // 1) Convert base64 -> Buffer (or handle file upload from multipart/form-data).
    const imageBuffer = Buffer.from(base64Image, 'base64')
    const fileName = `faces/${userId}-${Date.now()}.png`
    
    // 2) Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('faces')          // your storage bucket name
      .upload(fileName, imageBuffer, {
        contentType: 'image/png'
      })

    if (storageError) {
      return res.status(400).json({ error: storageError.message })
    }

    // 3) Construct a public URL (assuming your bucket is public or you generate a signed URL)
    const { data: publicUrlData } = supabase.storage
      .from('faces')
      .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    // 4) Insert record in user_images
    const { error: insertError } = await supabase
      .from('user_images')
      .insert({
        profile_id: userId,
        image_url: imageUrl
      })

    if (insertError) {
      return res.status(400).json({ error: insertError.message })
    }

    res.status(200).json({ message: 'Face image uploaded', url: imageUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 4. Generate a Thumbnail

When a user tries to generate a thumbnail, you need to:

1. **Check** how many credits they currently have.  
2. **Look up** the cost in `generation_types`.  
3. If they have enough credits:
   - Deduct the credits.
   - Generate the thumbnail via your AI pipeline (Replicate, etc.).
   - Insert a record in `generations`.

### Example: `POST /generate`
```js
app.post('/generate', async (req, res) => {
  try {
    const { userId, generationType, prompt } = req.body
    // 1) Lookup user's credits
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profileData) {
      return res.status(400).json({ error: 'Profile not found' })
    }

    // 2) Get the cost for the generation type
    const { data: genTypeData, error: genTypeError } = await supabase
      .from('generation_types')
      .select('cost_credits')
      .eq('type_key', generationType)
      .single()

    if (genTypeError || !genTypeData) {
      return res.status(400).json({ error: 'Invalid generation type' })
    }

    const cost = genTypeData.cost_credits
    if (profileData.credits < cost) {
      return res.status(400).json({ error: 'Not enough credits' })
    }

    // 3) Deduct credits first (or do it after successful generation).
    const newCreditBalance = profileData.credits - cost
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCreditBalance })
      .eq('id', userId)
    if (updateError) {
      return res.status(400).json({ error: 'Could not deduct credits' })
    }

    // 4) Call your AI generation pipeline (e.g., Replicate or custom):
    //    Here, we just mock the result.
    const outputImageUrl = `https://cdn.example.com/generated/${Date.now()}.png`
    // In reality, you'd do something like:
    // const replicateResponse = await replicate.run(model, { prompt })
    // const outputImageUrl = replicateResponse?.[0] // or however it's returned

    // 5) Insert a record in `generations`
    const { data: generationData, error: genInsertError } = await supabase
      .from('generations')
      .insert({
        profile_id: userId,
        generation_type: generationType,
        output_image_url: outputImageUrl,
        credit_cost: cost
      })
      .single()

    if (genInsertError) {
      // Optionally revert credits if generation fails
      return res.status(400).json({ error: genInsertError.message })
    }

    // Return the final image URL to the user
    res.status(200).json({
      message: 'Generation successful',
      thumbnail: outputImageUrl,
      generationRecord: generationData
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 5. Buy Credits (One‐Time Payment)

If the user purchases a **one‐time** credit pack (via Stripe, for example), you’ll:

1. **Insert** a payment record into `payments`.  
2. **Add** the purchased credits to `profiles.credits`.

### Example: `POST /buy-credits`
```js
app.post('/buy-credits', async (req, res) => {
  try {
    const { userId, stripePaymentId, amount, creditsToAdd } = req.body

    // 1) Insert into payments
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        profile_id: userId,
        stripe_payment_id: stripePaymentId,
        amount: amount,
        credits_added: creditsToAdd
      })
      .single()

    if (paymentError) {
      return res.status(400).json({ error: paymentError.message })
    }

    // 2) Update the user's profile credits
    //    Get the user's current credits
    const { data: profileData } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    const updatedCredits = (profileData?.credits || 0) + creditsToAdd

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: updatedCredits })
      .eq('id', userId)

    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }

    res.status(200).json({
      message: 'Credits purchased successfully',
      payment: paymentData
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 6. Subscriptions

When a user purchases a **subscription** (e.g. monthly plan), you might:

1. Log a payment in `payments` (if you want to track that).
2. Insert or update a row in `subscriptions` with `plan_name`, `is_active`, `start_date`, `end_date`.
3. Optionally add some credits, or let the subscription logic handle monthly credit resets.

### Example: `POST /subscribe`
```js
app.post('/subscribe', async (req, res) => {
  try {
    const { userId, planName, stripePaymentId, amount } = req.body

    // 1) Log the subscription payment
    const { data: payData, error: payError } = await supabase
      .from('payments')
      .insert({
        profile_id: userId,
        stripe_payment_id: stripePaymentId,
        amount: amount,
        credits_added: 0 // if subscription doesn't directly add credits, set 0
      })
      .single()

    if (payError) {
      return res.status(400).json({ error: payError.message })
    }

    // 2) Insert or update subscriptions
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1) // 1-month plan

    // example upsert logic (profile_id + plan_name as unique constraint if you want)
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: userId,
        plan_name: planName,
        is_active: true,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .single()

    if (subError) {
      return res.status(400).json({ error: subError.message })
    }

    // 3) If your plan gives monthly credits:
    //    e.g., monthly_25images => 250 credits
    if (planName === 'monthly_25images') {
      // fetch the user’s current credits
      const { data: profileData } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      
      const newCreditTotal = (profileData?.credits || 0) + 250
      await supabase
        .from('profiles')
        .update({ credits: newCreditTotal })
        .eq('id', userId)
    }

    res.status(200).json({
      message: 'Subscription active',
      subscription: subData
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 7. Putting It All Together

In a real application, you’d have:

- **Authentication Middleware**: For example, verifying the user’s Supabase auth token.  
- **Error Handling**: More robust try/catch blocks, or a global error handler.  
- **Validation**: Checking request payload with a library like `Joi` or `Zod`.  
- **Security**: Setting up Supabase [Row Level Security (RLS)](https://supabase.com/docs/guides/auth#row-level-security) so users can only access their own data.  

### Example: Fetching Profile Data
Just for completeness, you might have a route to get user’s profile and credits:
```js
app.get('/profile', async (req, res) => {
  try {
    const userId = req.query.userId
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('credits, referral_code, referred_by')
      .eq('id', userId)
      .single()

    if (error || !profileData) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    res.status(200).json(profileData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 8. Run Your Server

Finally, start the server. For example:
```js
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
```

---

## Summary

- **Supabase Auth**: Creates users automatically in the `auth.users` table.  
- **`profiles`**: For each new user in `auth.users`, create a row with credits & referral info.  
- **Workflow**:  
  1. **Sign up** → create user in `auth.users` + `profiles`.  
  2. **Referral** → if `referred_by` code is valid, reward the referrer.  
  3. **Upload face** → store in `supabase.storage`, then insert into `user_images`.  
  4. **Generate thumbnail** → check/deduct credits, store a record in `generations`.  
  5. **Buy credits** → insert a payment record, add credits to `profiles`.  
  6. **Subscriptions** → create a row in `subscriptions`, optionally add credits monthly or set unlimited usage logic.  

This Node.js example provides a **clear** set of endpoints for each main step. You can **copy, paste, and adapt** this code to your chosen architecture. The key takeaway is how to **link** each action to the corresponding **Supabase** tables and keep track of user credits, referrals, payments, and generative usage.