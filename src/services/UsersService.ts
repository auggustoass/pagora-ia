
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilters } from '@/types/user';
import { toast } from 'sonner';

export class UsersService {
  static async fetchUsers(filters?: UserFilters): Promise<User[]> {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Then get all user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');
      
      // Get users with auth data and profiles combined
      let usersWithData: User[] = [];
      
      // Need to fetch each user's email using their ID
      for (const profile of profiles) {
        try {
          // Use admin API to get user details by ID
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
          
          // Check if user is admin
          const isAdmin = roles?.some(role => 
            role.user_id === profile.id && role.role === 'admin'
          ) || false;
          
          usersWithData.push({
            ...profile,
            email: authUser?.user?.email || profile.id, // Use email from auth or fallback to ID
            is_admin: isAdmin,
            phone: profile.phone || ''
          });
        } catch (error) {
          console.error(`Error fetching user ${profile.id}:`, error);
          // Fallback to using the ID as the email
          usersWithData.push({
            ...profile,
            email: profile.id,
            is_admin: roles?.some(role => role.user_id === profile.id && role.role === 'admin') || false,
            phone: profile.phone || ''
          });
        }
      }
      
      // Apply filters if provided
      if (filters) {
        if (filters.search && filters.search.trim() !== '') {
          const searchTerm = filters.search.toLowerCase();
          usersWithData = usersWithData.filter(user => 
            user.first_name?.toLowerCase().includes(searchTerm) || 
            user.last_name?.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone?.toLowerCase().includes(searchTerm) ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.role) {
          if (filters.role === 'admin') {
            usersWithData = usersWithData.filter(user => user.is_admin);
          } else if (filters.role === 'user') {
            usersWithData = usersWithData.filter(user => !user.is_admin);
          }
        }
      }
      
      return usersWithData;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      return [];
    }
  }

  static async updateUser(user: User): Promise<boolean> {
    try {
      if (!user.id) return false;
      
      // Update existing user
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      // Handle admin role
      if (user.is_admin) {
        // First check if already has role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');
        
        if (!existingRole || existingRole.length === 0) {
          // Add admin role
          await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'admin'
            });
        }
      } else {
        // Remove admin role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id)
          .eq('role', 'admin');
      }

      toast.success('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
      return false;
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      // In a real app, we would delete the auth user which would cascade to profile
      // Here we'll just delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;

      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return false;
    }
  }
}
