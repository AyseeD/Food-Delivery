import {db} from "../db.js";

//get all of the credit cards
export const getAllCredits = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await db.query(
      `SELECT * FROM credit_cards 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get credit cards" });
  }
}

//add new credit card, demo so not complex
export const addCreditCard = async (req, res) => {
  const { user_id, card_nickname, card_number, card_holder, expiry_month, expiry_year, cvv, is_default } = req.body;
  
  try {
    //make sure cart has 8 digits at least
    const cleanedCardNumber = card_number.replace(/\D/g, '');
    if (cleanedCardNumber.length < 8) {
      return res.status(400).json({ error: "Card number must be at least 8 digits for demo" });
    }

    //ignore expiry date in future
    const currentYear = new Date().getFullYear();
    if (expiry_year < currentYear - 1) {
      return res.status(400).json({ error: "Card expiry seems too old" });
    }

    //when adding as default if another is default change that
    if (is_default) {
      await db.query(
        `UPDATE credit_cards SET is_default = FALSE WHERE user_id = $1`,
        [user_id]
      );
    }
    
    const result = await db.query(
      `INSERT INTO credit_cards 
       (user_id, card_nickname, card_number, card_holder, expiry_month, expiry_year, cvv, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, card_nickname || null, cleanedCardNumber, card_holder, 
       expiry_month, expiry_year, cvv, is_default || false]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add credit card" });
  }
}

//update existing credit card
export const updateCard = async (req, res) => {
  const { cardId } = req.params;
  const { card_nickname, card_holder, expiry_month, expiry_year, is_default, user_id } = req.body;
  
  try {
    //when adding as default if another is default change that
    if (is_default) {
      await db.query(
        `UPDATE credit_cards SET is_default = FALSE WHERE user_id = $1 AND card_id != $2`,
        [user_id, cardId]
      );
    }
    
    const result = await db.query(
      `UPDATE credit_cards 
       SET card_nickname = $1, 
           card_holder = $2, 
           expiry_month = $3, 
           expiry_year = $4, 
           is_default = $5,
           created_at = created_at
       WHERE card_id = $6
       RETURNING *`,
      [card_nickname || null, card_holder, expiry_month, expiry_year, is_default, cardId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Credit card not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update credit card" });
  }
}

//delete existing credit cards
export const deleteCard = async (req, res) => {
  const { cardId } = req.params;
  
  try {
    const result = await db.query(
      `DELETE FROM credit_cards WHERE card_id = $1 RETURNING *`,
      [cardId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Credit card not found" });
    }
    
    // If deleted card was default, set another as default
    if (result.rows[0].is_default) {
      const newDefault = await db.query(
        `SELECT card_id FROM credit_cards 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [result.rows[0].user_id]
      );
      
      if (newDefault.rows.length > 0) {
        await db.query(
          `UPDATE credit_cards SET is_default = TRUE WHERE card_id = $1`,
          [newDefault.rows[0].card_id]
        );
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete credit card" });
  }
}

//set a card as default
export const setDefault= async (req, res) => {
  const { cardId } = req.params;
  const { user_id } = req.body;
  
  try {
    //unset all other defaults
    await db.query(
      `UPDATE credit_cards SET is_default = FALSE WHERE user_id = $1`,
      [user_id]
    );
    
    //set this card as default
    const result = await db.query(
      `UPDATE credit_cards 
       SET is_default = TRUE 
       WHERE card_id = $1 AND user_id = $2
       RETURNING *`,
      [cardId, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Credit card not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set default card" });
  }
}