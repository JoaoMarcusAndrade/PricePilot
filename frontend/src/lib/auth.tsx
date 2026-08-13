import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

export type DemoUser = {
    id: string;
    email: string;
};

export type Profile = {
    id: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
};

type AuthContextValue = {
    user: DemoUser | null;
    profile: Profile | null;
    loading: boolean;

    signIn: (
        email: string,
        password: string
    ) => Promise<{ error: string | null }>;

    signUp: (
        name: string,
        email: string,
        password: string
    ) => Promise<{ error: string | null }>;

    signInWithGoogle: () => Promise<{ error: string | null }>;

    updateProfile: (
        changes: Pick<Profile, "full_name" | "phone">
    ) => Promise<{ error: string | null }>;

    signOut: () => Promise<void>;
};

const SESSION_KEY = "pricepilot.session";

const API_URL = "http://localhost:3000/api";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type BackendUser = {
    id: number;
    name: string;
    picture: string;
    email: string;
    telephone: string;
    pass: string;
};

type Session = {
    userId: number;
};

function readSession(): Session | null {
    try {
        const value = localStorage.getItem(SESSION_KEY);

        if (!value) {
            return null;
        }

        return JSON.parse(value) as Session;
    } catch {
        return null;
    }
}

function saveSession(userId: number) {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
            userId
        })
    );
}

function removeSession() {
    localStorage.removeItem(SESSION_KEY);
}

function backendUserToUser(user: BackendUser): DemoUser {
    return {
        id: String(user.id),
        email: user.email
    };
}

function backendUserToProfile(user: BackendUser): Profile {
    return {
        id: String(user.id),
        full_name: user.name,
        phone: user.telephone || null,
        avatar_url: user.picture || null
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<DemoUser | null>(null);

    const [profile, setProfile] = useState<Profile | null>(null);

    const [loading, setLoading] = useState(true);

    async function getUserFromBackend(userId: number) {
        const response = await fetch(`${API_URL}/users/${userId}`);

        if (!response.ok) {
            throw new Error("Não foi possível carregar o usuário.");
        }

        const data = (await response.json()) as BackendUser;

        setUser(backendUserToUser(data));
        setProfile(backendUserToProfile(data));
    }

    useEffect(() => {
        async function restoreSession() {
            const session = readSession();

            if (!session) {
                setLoading(false);
                return;
            }

            try {
                await getUserFromBackend(session.userId);
            } catch {
                removeSession();
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }

        restoreSession();
    }, []);

    async function signIn(email: string, password: string) {
        try {
            console.log("EMAIL NO SIGNUP:", email);
            const response = await fetch(`${API_URL}/users/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    pass: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.error || "E-mail ou senha inválidos."
                };
            }

            const backendUser = data as BackendUser;

            saveSession(backendUser.id);

            setUser(backendUserToUser(backendUser));
            setProfile(backendUserToProfile(backendUser));

            return {
                error: null
            };
        } catch {
            return {
                error: "Não foi possível conectar ao servidor."
            };
        }
    }

    async function signUp(
        name: string,
        email: string,
        password: string
    ) {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    picture: "",
                    email,
                    telephone: null,
                    pass: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.error || "Não foi possível criar a conta."
                };
            }

            const backendUser = data as BackendUser;

            saveSession(backendUser.id);

            setUser(backendUserToUser(backendUser));
            setProfile(backendUserToProfile(backendUser));

            return {
                error: null
            };
        } catch {
            return {
                error: "Não foi possível conectar ao servidor."
            };
        }
    }

    async function updateProfile(
        changes: Pick<Profile, "full_name" | "phone">
    ) {
        if (!user) {
            return {
                error: "Nenhum usuário está autenticado."
            };
        }

        try {
            const response = await fetch(
                `${API_URL}/users/${user.id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: changes.full_name,
                        telephone: changes.phone ?? ""
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.error || "Não foi possível atualizar o perfil."
                };
            }

            const backendUser = data as BackendUser;

            setUser(backendUserToUser(backendUser));
            setProfile(backendUserToProfile(backendUser));

            return {
                error: null
            };
        } catch {
            return {
                error: "Não foi possível conectar ao servidor."
            };
        }
    }

    async function signInWithGoogle() {
        return {
            error: "Login com Google ainda não está disponível."
        };
    }

    async function signOut() {
        removeSession();

        setUser(null);
        setProfile(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                signIn,
                signUp,
                signInWithGoogle,
                updateProfile,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
}