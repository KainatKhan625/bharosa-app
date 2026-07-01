// workerController.js
// Handles all worker related operations
// Get workers, filter by service/city, search, get worker profile

const pool = require('../db');

// Get all available workers with optional filters + search
const getWorkers = async (req, res) => {
  try {
    const { service_type, city, min_rating, search } = req.query;

    let query = `
      SELECT 
        w.id,
        w.service_type,
        w.hourly_rate,
        w.experience_years,
        w.avg_rating,
        w.total_reviews,
        w.total_jobs,
        w.is_available,
        w.profile_image,
        w.bio,
        w.city,
        w.area,
        u.full_name,
        u.phone
      FROM workers w
      JOIN users u ON w.user_id = u.id
      WHERE w.is_verified = TRUE
      AND w.is_available = TRUE
    `;

    const values = [];
    let paramCount = 1;

    if (service_type) {
      query += ` AND w.service_type = $${paramCount}`;
      values.push(service_type);
      paramCount++;
    }

    if (city) {
      query += ` AND w.city = $${paramCount}`;
      values.push(city);
      paramCount++;
    }

    if (min_rating) {
      query += ` AND w.avg_rating >= $${paramCount}`;
      values.push(min_rating);
      paramCount++;
    }

    // Search by service type only — not name
if (search) {
  query += ` AND w.service_type ILIKE $${paramCount}`;
  values.push(`%${search}%`);
  paramCount++;
}

    query += ` ORDER BY w.avg_rating DESC`;

    const result = await pool.query(query, values);

    res.status(200).json({
      message: 'Workers fetched successfully!',
      count: result.rows.length,
      workers: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Get single worker profile by ID
const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        w.*,
        u.full_name,
        u.phone,
        u.email
      FROM workers w
      JOIN users u ON w.user_id = u.id
      WHERE w.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Worker not found!' });
    }

    // Get worker reviews
    const reviews = await pool.query(`
      SELECT 
        r.rating,
        r.comment,
        r.created_at,
        u.full_name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.worker_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    res.status(200).json({
      worker: result.rows[0],
      reviews: reviews.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

// Update worker profile
const updateWorkerProfile = async (req, res) => {
  try {
    const { bio, hourly_rate, experience_years, area, whatsapp, services_offered, is_available } = req.body;
    const userId = req.user.id;

    const result = await pool.query(`
      UPDATE workers 
      SET 
        bio = COALESCE($1, bio),
        hourly_rate = COALESCE($2, hourly_rate),
        experience_years = COALESCE($3, experience_years),
        area = COALESCE($4, area),
        whatsapp = COALESCE($5, whatsapp),
        services_offered = COALESCE($6, services_offered),
        is_available = $7
      WHERE user_id = $8
      RETURNING *
    `, [bio, hourly_rate, experience_years, area, whatsapp, services_offered, is_available, userId]);

    res.status(200).json({
      message: 'Profile updated!',
      worker: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { getWorkers, getWorkerById, updateWorkerProfile };