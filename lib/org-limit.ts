import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { MAX_FREE_BOARDS } from "@/constants/boards";

//FOR INCREASING AVAILABLE BOARD COUNT
export const incrementAvailableCount = async () => {
    const { orgId } = auth()

    if (!orgId) {
        throw new Error("Unauthorized")
    }

    const orgLimit = await db.orgLimit.findUnique({
            where: { orgId }
    })

    if (orgLimit) {
        await db.orgLimit.update({
            where: { orgId },
            data: { count: orgLimit.count + 1 }
        })
    } else {
        await db.orgLimit.create({
            data: { orgId, count: 1 }
        });
    }
};

//FOR DECREASING AVAILABLE BOARD COUNT
export const decreaseAvailableCount = async () => {
    const { orgId } = auth()

    if (!orgId) {
        throw new Error("Unauthorized")
    }

    const orgLimit = await db.orgLimit.findUnique({
            where: { orgId }
    })

    if (orgLimit) {
        await db.orgLimit.update({
            where: { orgId },
            data: { count: orgLimit.count > 0 ? orgLimit.count - 1 : 0 }
        })
    } else {
        await db.orgLimit.create({
            data: { orgId, count: 1 }
        });
    }
};

// HELPER METHOD TO CHECK IF A USER CAN CREATE A NEW FREE BOARD.

export const hasAvailableCount = async () => {
    const { orgId } = auth()

    if (!orgId) {
        throw new Error ("Unauthorized")
    }


    const orgLimit = await db.orgLimit.findUnique({
        where: { orgId }
    })

    if (!orgLimit || orgLimit.count < MAX_FREE_BOARDS ) {
        return true;
    } else {
        return false;
    }
};

// HELPER FUNCTION TO TELL US NUMBER OF FREE BOARDS USERS HAVE USED UP..

export const getAvailableCount = async () => {
    const { orgId } = auth();

    if(!orgId) {
        return 0;
    }

    const orgLimit = await db.orgLimit.findUnique({
        where: { orgId}
    })

    if (!orgLimit) {
        return 0;
    }

    return orgLimit.count;
}