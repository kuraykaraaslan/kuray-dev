import BreadCrumb from '@/components/admin/BreadCrumb';
import PostsTable from '@/components/admin/tables/PostsTable';
import React from 'react';

const Page: React.FC = () => {
    return (
        <>
            <PostsTable />
        </>
    );
};

export default Page;