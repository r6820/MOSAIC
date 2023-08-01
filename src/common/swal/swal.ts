import Swal from 'sweetalert2'

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    iconColor: 'white',
    customClass: {
        popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
})

function outsideClick() {
    const popup = Swal.getPopup()
    popup?.classList.remove('swal2-show')
    setTimeout(() => {
        popup?.classList.add('animate__animated', 'animate__headShake')
    });
    setTimeout(() => {
        popup?.classList.remove('animate__animated', 'animate__headShake')
    }, 500);
    return false
}

export function inputSwal(confirmButtonText: string, preConfirm: (text: string) => void, Onfulfilled?: () => void) {
    Swal.fire({
        title: 'Input Game Record Name',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        showLoaderOnConfirm: true,
        preConfirm: preConfirm,
        allowOutsideClick: outsideClick
    }).then((result) => {
        (Onfulfilled||(()=>{}))();
        if (result.isConfirmed) {
            Toast.fire({
                icon: 'success',
                title: 'Saved'
            });
        }
    }).catch(() => {
        (Onfulfilled||(()=>{}))();
        Toast.fire({
            icon: 'error',
            title: 'Error'
        });
    });
}

export function selectSwal(confirmButtonText: string, keyNames: { [key: string]: string }, preConfirm: (text: string) => void, Onfulfilled: () => void) {
    Swal.fire({
        title: 'Select Game Record Name',
        input: 'select',
        inputOptions: keyNames,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        showLoaderOnConfirm: true,
        preConfirm: preConfirm,
        allowOutsideClick: outsideClick
    }).then((result) => {
        Onfulfilled();
        if (result.isConfirmed) {
            Toast.fire({
                icon: 'success',
                title: 'Load'
            });
        }
    }).catch(() => {
        Onfulfilled();
        Toast.fire({
            icon: 'error',
            title: 'Error'
        });
    });
}