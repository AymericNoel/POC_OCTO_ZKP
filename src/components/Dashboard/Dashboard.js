import React, { Component } from "react";

class Dashboard extends Component {
    render() {
        return (
            <>
                <div className='text-center'>
                  <h2 className='h2-responsive mb-4'>
                    <strong className='font-weight-bold'>
                   Plateforme de locations de jardins autonome
                    </strong>
                  </h2>
                  <p>Jardins en locations : </p>
                  <p className='pb-4'>Jardins sur la plateforme : </p>                  
                </div>
            </>
        );
    }
}

export default Dashboard;