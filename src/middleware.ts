import {
    createRouteMatcher,
    isAuthenticatedNextjs,
    nextjsMiddlewareRedirect,
    convexAuthNextjsMiddleware,
} from "@convex-dev/auth/nextjs/server";

// Define routes that require authentication
// Matches the section roots and everything under them.
const requiresAuth = createRouteMatcher([
    "/dashboard(.*)",
    "/settings(.*)",
    "/profile(.*)",
    "/billing(.*)"
]);

// Define public routes that are always accessible
const publicRoutes = createRouteMatcher([
    "/",
    "/auth",
    "/products",
    "/resources",
    "/community",
    "/company",
    "/services",
    "/privacy-policy",
    "/thankyou",
    "/products/mock-interviews"
]);

// The component kit is only built outside production and needs no account.
const isDevKit = createRouteMatcher(["/dashboard/dev-kit(.*)"]);

export default convexAuthNextjsMiddleware((req) => {
    if (process.env.NODE_ENV !== "production" && isDevKit(req)) {
        return undefined;
    }

    // Check if the requested route requires authentication
    if (requiresAuth(req)) {
        // Check if user is authenticated or is a guest
        const isGuest = req.cookies.get('userStatus')?.value === 'guest';
        const isAuthenticated = isAuthenticatedNextjs();

        if (!isAuthenticated && !isGuest) {
            return nextjsMiddlewareRedirect(req, "/auth");
        }
    }

    // Allow access to all other routes
    return undefined;
});

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)"
    ]
};