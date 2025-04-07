"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isEigenaar, setIsEigenaar] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/login");
          return;
        }

        setUserEmail(session.user.email);

        // First get the user's role assignments
        const { data: roleAssignments, error: assignmentsError } = await supabase
          .from('roles_per_user')
          .select('role_id')
          .eq('user_id', session.user.id);

        if (assignmentsError) {
          console.error('Error fetching role assignments:', assignmentsError);
          setError('Er is een fout opgetreden bij het ophalen van de rollen');
          return;
        }

        if (!roleAssignments?.length) {
          setUserRoles([]);
          return;
        }

        // Then get the role details
        const roleIds = roleAssignments.map(assignment => assignment.role_id);
        const { data: roles, error: rolesError } = await supabase
          .from('roles')
          .select('id, name, description')
          .in('id', roleIds);

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          setError('Er is een fout opgetreden bij het ophalen van de rollen');
          return;
        }

        if (roles) {
          setUserRoles(roles);
          setIsEigenaar(roles.some(role => role.name === 'eigenaar'));

          // If user is eigenaar, fetch volunteer applications
          if (roles.some(role => role.name === 'eigenaar')) {
            const { data: volunteerData, error: volunteerError } = await supabase
              .from('volunteers')
              .select('*')
              .order('created_at', { ascending: false });

            if (volunteerError) {
              console.error('Error fetching volunteers:', volunteerError);
              return;
            }

            if (volunteerData) {
              setVolunteers(volunteerData);
            }
          }
        }

      } catch (error) {
        console.error("Error checking auth:", error);
        setError('Er is een onverwachte fout opgetreden');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleStatusChange = async (volunteerId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ status: newStatus })
        .eq('id', volunteerId);

      if (error) throw error;

      setVolunteers(volunteers.map(volunteer => 
        volunteer.id === volunteerId 
          ? { ...volunteer, status: newStatus }
          : volunteer
      ));
    } catch (error) {
      console.error('Error updating volunteer status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-secondary">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Uitloggen
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welkom!</h2>
          <p className="text-gray-600">Je bent ingelogd als: {userEmail}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Jouw rollen:</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-2">
            {userRoles.length > 0 ? (
              userRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-gray-50 p-3 rounded-md border border-gray-200"
                >
                  <p className="font-medium text-gray-800">{role.name}</p>
                  {role.description && (
                    <p className="text-sm text-gray-600">{role.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">Geen rollen toegewezen.</p>
            )}
          </div>
        </div>

        {isEigenaar && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vrijwilligers Aanmeldingen</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefoon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bericht</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {volunteer.first_name} {volunteer.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{volunteer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{volunteer.phone_number}</td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {volunteer.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          volunteer.status === 'approved' ? 'bg-green-100 text-green-800' :
                          volunteer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {volunteer.status === 'approved' ? 'Goedgekeurd' :
                           volunteer.status === 'rejected' ? 'Afgewezen' :
                           'In behandeling'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {volunteer.status === 'pending' && (
                          <div className="space-x-2">
                            <button
                              onClick={() => handleStatusChange(volunteer.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Goedkeuren
                            </button>
                            <button
                              onClick={() => handleStatusChange(volunteer.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Afwijzen
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {volunteers.length === 0 && (
                <p className="text-gray-600 text-center py-4">Geen vrijwilligers aanmeldingen gevonden.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}