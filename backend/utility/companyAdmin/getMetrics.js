import User from '../../models/users.js';
import Advisory from '../../models/advisories.js';

export async function getCompanyAdminMetrics(req, res) {
    try {
        const companyId = req.user.company;

        const [
            totalEmployees,
            pendingUsers,
            pendingAdvisories,
            acknowledgedAdvisories
        ] = await Promise.all([
            User.countDocuments({ company: companyId, status: 'Approved' }),

            User.countDocuments({ company: companyId, status: 'Pending' }),

            Advisory.countDocuments({
                company: companyId,
                acknowledgedByCompanyAdminId: null
            }),

            Advisory.countDocuments({
                company: companyId,
                acknowledgedByCompanyAdminId: { $ne: null }
            })
        ]);

        return res.status(200).json({
            totalEmployees,
            pendingUsers,
            pendingAdvisories,
            acknowledgedAdvisories
        });
    } catch (err) {
        console.error('Error fetching company admin metrics:', err);
        return res.status(500).json({ message: 'Failed to fetch company metrics.' });
    }
}