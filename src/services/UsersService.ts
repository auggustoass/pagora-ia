
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilters } from '@/types/user';
import { toast } from 'sonner';

export class UsersService {
  static async fetchUsers(filters?: UserFilters): Promise<User[]> {
    try {
      // Get user auth data to match email with profile
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
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
      
      // For each profile, create a user with the profile data
      for (const profile of profiles) {
        // Check if user is admin
        const isAdmin = roles?.some(role => 
          role.user_id === profile.id && role.role === 'admin'
        ) || false;
        
        // Get the user's email
        let email = "";
        
        // If it's the current user, we know the email
        if (profile.id === authData?.user?.id) {
          email = authData.user.email || "";
        } else {
          email = `user-${profile.id.substring(0, 8)}@pagora.app`;
        }
        
        usersWithData.push({
          ...profile,
          email: email,
          is_admin: isAdmin,
          phone: profile.phone || ''
        });
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
